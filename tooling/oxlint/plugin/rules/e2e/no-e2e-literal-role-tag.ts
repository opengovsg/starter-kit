import { defineRule } from '@oxlint/plugins'

const ROLE_TAG_PREFIX = '@role:'

export const noE2eLiteralRoleTagRule = defineRule({
  createOnce(context) {
    return {
      Literal(node) {
        if (
          !('regex' in node) &&
          String(node.value).includes(ROLE_TAG_PREFIX)
        ) {
          context.report({ messageId: 'literalRoleTag', node })
        }
      },
      TemplateLiteral(node) {
        if (
          node.quasis.some((quasi) => quasi.value.raw.includes(ROLE_TAG_PREFIX))
        ) {
          context.report({ messageId: 'literalRoleTag', node })
        }
      },
    }
  },
  meta: {
    docs: {
      description:
        'Forbid hand-written `@role:` tags in e2e tests; use `roleTag(role)`.',
    },
    messages: {
      literalRoleTag:
        "Use `roleTag('<role>')` instead of a hand-written `@role:` tag; a typo makes the test silently never run.",
    },
    type: 'problem',
  },
})
