import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

const isConsole = (node: ESTree.Node | null | undefined) =>
  node?.type === 'Identifier' && node.name === 'console'

export const noConsoleRule = defineRule({
  createOnce(context) {
    return {
      MemberExpression(node) {
        if (!isConsole(node.object)) {
          return
        }

        if (!context.sourceCode.isGlobalReference(node.object)) {
          return
        }

        context.report({ messageId: 'noConsole', node })
      },
    }
  },
  meta: {
    docs: {
      description:
        'Ban console so the lint message tells the caller which logger to use.',
    },
    messages: {
      noConsole:
        'Server code logs with `createBaseLogger` or `createBaseLogger.system` from `@acme/logging`. Browser code shows a toast or a form error. A script that exists to print keeps the call and adds `oxlint-disable-next-line acme/no-console` with the reason.',
    },
    type: 'problem',
  },
})
