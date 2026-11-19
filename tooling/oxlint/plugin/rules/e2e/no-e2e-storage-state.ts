import { defineRule } from '@oxlint/plugins'

import { getName } from '../../ast.ts'

const STORAGE_STATE_METHODS = new Set([
  'extend',
  'newContext',
  'newPage',
  'use',
])

/**
 * Forbid setting `storageState` in e2e tests (`test.use`, `test.extend`,
 * `browser.newContext`/`newPage`). Sign in by tagging the describe with
 * `roleTag(...)` instead; playwright.config.ts wires the session per role.
 *
 * ponytail: syntactic only, misses options passed through a variable or spread.
 *
 * @see apps/web/tests/e2e/README.md
 */
export const noE2eStorageStateRule = defineRule({
  createOnce(context) {
    return {
      CallExpression(node) {
        const { callee } = node

        if (
          callee.type !== 'MemberExpression' ||
          !STORAGE_STATE_METHODS.has(getName(callee) ?? '')
        ) {
          return
        }

        for (const arg of node.arguments) {
          if (arg.type !== 'ObjectExpression') {
            continue
          }

          for (const property of arg.properties) {
            if (
              property.type === 'Property' &&
              getName(property) === 'storageState'
            ) {
              context.report({ messageId: 'storageState', node: property })
            }
          }
        }
      },
    }
  },
  meta: {
    docs: {
      description:
        'Forbid setting `storageState` in e2e tests; sign in via `roleTag`.',
    },
    messages: {
      storageState:
        "Don't set `storageState` in a test. Tag the `test.describe` with `{ tag: roleTag('user') }` to run signed in.",
    },
    type: 'problem',
  },
})
