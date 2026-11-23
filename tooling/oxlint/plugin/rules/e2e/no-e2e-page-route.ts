import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

import { getName } from '../../ast.ts'

const NETWORK_STUB = '/tests/e2e/helpers/network.ts'

const normalize = (filename: string) => filename.replaceAll('\\', '/')

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

const isInlineRoute = (filename: string) => {
  const norm = normalize(filename)

  return norm.includes('/tests/e2e/') && !norm.endsWith(NETWORK_STUB)
}

export const noE2ePageRouteRule = defineRule({
  createOnce(context) {
    return {
      CallExpression(node) {
        if (!isInlineRoute(context.filename)) {
          return
        }

        const member = memberCallee(node.callee)

        if (member === null || getName(member) !== 'route') {
          return
        }

        context.report({ messageId: 'route', node })
      },
    }
  },
  meta: {
    docs: {
      description:
        'Keep page.route stubs in helpers/network.ts, where the e2e README puts them.',
    },
    messages: {
      route:
        'Call `page.route` from helpers/network.ts. Import that stub instead of routing inline.',
    },
    type: 'problem',
  },
})
