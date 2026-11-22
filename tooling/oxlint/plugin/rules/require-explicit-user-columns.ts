import { defineRule } from '@oxlint/plugins'
import type { Context, ESTree } from '@oxlint/plugins'

import { getName } from '../ast.ts'

const USER_ROW_METHODS = new Set([
  'create',
  'createManyAndReturn',
  'delete',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'updateManyAndReturn',
  'upsert',
])

const KYSELY_TABLE_METHODS = new Set([
  'crossJoin',
  'deleteFrom',
  'fullJoin',
  'innerJoin',
  'insertInto',
  'leftJoin',
  'mergeInto',
  'replaceInto',
  'rightJoin',
  'selectFrom',
  'updateTable',
])

const KYSELY_ALL_METHODS = new Set(['returningAll', 'selectAll'])

const RELATION_KEYS = new Set(['include', 'select'])

const KYSELY_USER_TABLE = /^User(?:\s+as\s+(?<alias>\w+))?$/u

const RAW_STAR = /\b(?:select|returning)\s+(?:"?\w+"?\.)?\*/iu
const RAW_SQL_CALLS = new Set(['$queryRawUnsafe', '$executeRawUnsafe'])
const RAW_SQL_TAGS = new Set(['$queryRaw', '$executeRaw', 'sql'])

const getStringValue = (node: ESTree.Node | null | undefined) => {
  if (node?.type === 'Literal') {
    return String(node.value)
  }

  if (node?.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => quasi.value.raw).join(' ')
  }

  return null
}

const getTagName = (tag: ESTree.Expression) => {
  if (tag.type === 'Identifier') {
    return tag.name
  }

  return tag.type === 'MemberExpression' ? getName(tag) : null
}

const isNullish = (node: ESTree.Node): boolean =>
  (node.type === 'Literal' && node.value === null) ||
  (node.type === 'Identifier' && node.name === 'undefined') ||
  (node.type === 'UnaryExpression' && node.operator === 'void') ||
  (node.type === 'ConditionalExpression' &&
    (isNullish(node.consequent) || isNullish(node.alternate)))

const isRawUserStar = (text: string | null) =>
  text !== null && text.includes('"User"') && RAW_STAR.test(text)

const findSelect = (object: ESTree.ObjectExpression) => {
  let select: ESTree.ObjectProperty | null = null

  for (const property of object.properties) {
    if (property.type === 'SpreadElement') {
      select = null
    } else if (getName(property) === 'select') {
      select = property
    }
  }

  return select
}

const collectUserTables = (arg: ESTree.Node | undefined, into: Set<string>) => {
  const values = arg?.type === 'ArrayExpression' ? arg.elements : [arg]

  for (const value of values) {
    const match = KYSELY_USER_TABLE.exec(getStringValue(value) ?? '')

    if (match) {
      into.add('User')

      if (match.groups?.alias !== undefined) {
        into.add(match.groups.alias)
      }
    }
  }
}

const getChainCalls = (node: ESTree.CallExpression) => {
  const calls: ESTree.CallExpression[] = []
  let current: ESTree.Node = node

  while (
    current.type === 'CallExpression' &&
    current.callee.type === 'MemberExpression'
  ) {
    calls.push(current)
    current = current.callee.object
  }

  current = node

  while (
    current.parent.type === 'MemberExpression' &&
    current.parent.parent.type === 'CallExpression' &&
    current.parent.parent.callee === current.parent
  ) {
    current = current.parent.parent
    calls.push(current)
  }

  return calls
}

const checkKyselyAll = (
  context: Context,
  node: ESTree.CallExpression,
  method: string
) => {
  const userTables = new Set<string>()

  for (const call of getChainCalls(node)) {
    if (
      call.callee.type === 'MemberExpression' &&
      KYSELY_TABLE_METHODS.has(getName(call.callee) ?? '')
    ) {
      collectUserTables(call.arguments.at(0), userTables)
    }
  }

  const scopeArg = node.arguments.at(0)

  const scopes =
    scopeArg?.type === 'ArrayExpression' ? scopeArg.elements : [scopeArg]

  const leaks =
    scopeArg === undefined
      ? userTables.size > 0
      : scopes.some((scope) => {
          const name = getStringValue(scope)

          return name === 'User' || userTables.has(name ?? '')
        })

  if (leaks) {
    context.report({ data: { method }, messageId: 'kyselyAll', node })
  }
}

const checkUserDelegate = (
  context: Context,
  node: ESTree.CallExpression,
  callee: ESTree.MemberExpression,
  method: string
) => {
  if (
    !USER_ROW_METHODS.has(method) ||
    callee.object.type !== 'MemberExpression' ||
    getName(callee.object) !== 'user'
  ) {
    return
  }

  const args = node.arguments.at(0)
  const select = args?.type === 'ObjectExpression' ? findSelect(args) : null

  if (select === null) {
    context.report({ data: { method }, messageId: 'missingSelect', node })
  } else if (isNullish(select.value)) {
    context.report({
      data: { method },
      messageId: 'nullishSelect',
      node: select,
    })
  }
}

const isFluentUser = (callee: ESTree.MemberExpression) => {
  let current: ESTree.Node = callee.object

  while (
    current.type === 'CallExpression' &&
    current.callee.type === 'MemberExpression'
  ) {
    if (USER_ROW_METHODS.has(getName(current.callee) ?? '')) {
      return true
    }

    current = current.callee.object
  }

  return false
}

const hasSelect = (args: ESTree.Node | undefined) => {
  const select = args?.type === 'ObjectExpression' ? findSelect(args) : null

  return select !== null && !isNullish(select.value)
}

export const requireExplicitUserColumnsRule = defineRule({
  createOnce(context) {
    return {
      CallExpression(node) {
        const { callee } = node

        if (callee.type !== 'MemberExpression') {
          return
        }

        const method = getName(callee)

        if (method === null) {
          return
        }

        if (RAW_SQL_CALLS.has(method)) {
          if (isRawUserStar(getStringValue(node.arguments.at(0)))) {
            context.report({ messageId: 'rawSelectStar', node })
          }
        } else if (KYSELY_ALL_METHODS.has(method)) {
          checkKyselyAll(context, node, method)
        } else if (method === 'user' && isFluentUser(callee)) {
          if (!hasSelect(node.arguments.at(0))) {
            context.report({ messageId: 'relationWithoutSelect', node })
          }
        } else {
          checkUserDelegate(context, node, callee, method)
        }
      },
      Property(node) {
        if (
          getName(node) !== 'user' ||
          node.parent.type !== 'ObjectExpression'
        ) {
          return
        }

        const container = node.parent.parent
        const outer = container.parent?.parent

        if (
          container.type !== 'Property' ||
          !RELATION_KEYS.has(getName(container) ?? '') ||
          (outer?.type === 'Property' && getName(outer) === '_count')
        ) {
          return
        }

        const { value } = node

        if (value.type === 'Literal' && value.value === false) {
          return
        }

        if (!hasSelect(value)) {
          context.report({ messageId: 'relationWithoutSelect', node })
        }
      },
      TaggedTemplateExpression(node) {
        const name = getTagName(node.tag)

        if (
          name !== null &&
          RAW_SQL_TAGS.has(name) &&
          isRawUserStar(getStringValue(node.quasi))
        ) {
          context.report({ messageId: 'rawSelectStar', node })
        }
      },
    }
  },
  meta: {
    docs: {
      description:
        'Require an explicit column list wherever User rows are read (Prisma, Kysely, raw SQL) to avoid leaking fields.',
    },
    messages: {
      kyselyAll:
        'Replace `{{method}}()` with an explicit column list on queries that touch `User`.',
      missingSelect:
        'Pass `select` to `user.{{method}}` (e.g. `defaultUserSelect`) in an inline object, after any spread, so only the fields you need are returned.',
      nullishSelect:
        '`select` on `user.{{method}}` must not be null or undefined; that returns every field.',
      rawSelectStar:
        'List User columns explicitly instead of `*` in raw SQL against `"User"`.',
      relationWithoutSelect:
        'Load the `user` relation with `{ select: … }` (e.g. `defaultUserSelect`), not `true`, so only the fields you need are returned.',
    },
    type: 'problem',
  },
})
