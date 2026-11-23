import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

import { getName } from '../../ast.ts'

const WRITES = new Set([
  '$executeRaw',
  '$executeRawUnsafe',
  '$transaction',
  'create',
  'createMany',
  'createManyAndReturn',
  'delete',
  'deleteMany',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
])

const memberCallee = (callee: ESTree.Node) => {
  if (callee.type === 'MemberExpression') {
    return callee
  }

  if (
    callee.type === 'ChainExpression' &&
    callee.expression.type === 'MemberExpression'
  ) {
    return callee.expression
  }

  return null
}

const rootName = (member: ESTree.MemberExpression) => {
  let object: ESTree.Node = member.object

  while (
    object.type === 'MemberExpression' ||
    object.type === 'ChainExpression'
  ) {
    object =
      object.type === 'ChainExpression' ? object.expression : object.object
  }

  return object.type === 'Identifier' ? object.name : null
}

export const noE2eDbWritesRule = defineRule({
  createOnce(context) {
    const check = (node: ESTree.Node, callee: ESTree.Node) => {
      if (!context.filename.endsWith('.db.ts')) {
        return
      }

      const member = memberCallee(callee)
      const method = member === null ? null : getName(member)

      if (
        member === null ||
        method === null ||
        !WRITES.has(method) ||
        rootName(member) !== 'db'
      ) {
        return
      }

      context.report({ data: { method }, messageId: 'write', node })
    }

    return {
      CallExpression(node) {
        check(node, node.callee)
      },
      TaggedTemplateExpression(node) {
        check(node, node.tag)
      },
    }
  },
  meta: {
    docs: {
      description:
        'Keep helpers/<entity>.db.ts read-only. Writes belong in a factory.',
    },
    messages: {
      write:
        '`{{method}}()` writes through `db`. helpers/<entity>.db.ts is read-only; put this in helpers/<entity>.factory.ts.',
    },
    type: 'problem',
  },
})
