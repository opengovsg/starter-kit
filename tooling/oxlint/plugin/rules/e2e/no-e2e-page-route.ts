import { defineRule } from '@oxlint/plugins'

import { getName } from '../../ast.ts'

export const noE2ePageRouteRule = defineRule({
  createOnce(context) {
    return {
      CallExpression(node) {
        const { callee } = node

        if (callee.type === 'MemberExpression' && getName(callee) === 'route') {
          context.report({ messageId: 'route', node })
        }
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
