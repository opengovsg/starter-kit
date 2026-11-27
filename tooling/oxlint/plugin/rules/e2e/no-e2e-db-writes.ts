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

const rootName = (node: ESTree.Node): string | null => {
  if (node.type === 'MemberExpression') {
    return rootName(node.object)
  }

  return node.type === 'Identifier' ? node.name : null
}

const writeMethod = (callee: ESTree.Node) => {
  if (callee.type !== 'MemberExpression') {
    return null
  }

  const method = getName(callee)

  return method !== null && WRITES.has(method) && rootName(callee) === 'db'
    ? method
    : null
}

export const noE2eDbWritesRule = defineRule({
  createOnce(context) {
    return {
      CallExpression(node) {
        const method = writeMethod(node.callee)

        if (method !== null) {
          context.report({ data: { method }, messageId: 'write', node })
        }
      },
      TaggedTemplateExpression(node) {
        const method = writeMethod(node.tag)

        if (method !== null) {
          context.report({ data: { method }, messageId: 'write', node })
        }
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
