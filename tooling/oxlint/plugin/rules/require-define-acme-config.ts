import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

const isDefineAcmeConfig = (node: ESTree.Node | null | undefined) =>
  node?.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'defineAcmeConfig'

/**
 * Require an `oxlint.config.*` default export to come from `defineAcmeConfig`.
 * Oxlint drops `env` and `settings` from `extends`, so a plain `defineConfig`
 * root silently loses browser globals, React Doctor's mode and Tailwind's entry.
 *
 * ponytail: syntactic only, trusts any `defineAcmeConfig` call and only follows
 * `export default <name>` to a top-level `const`.
 */
export const requireDefineAcmeConfigRule = defineRule({
  createOnce(context) {
    const acmeConfigNames = new Set<string>()

    return {
      before() {
        acmeConfigNames.clear()
      },
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier' && isDefineAcmeConfig(node.init)) {
          acmeConfigNames.add(node.id.name)
        }
      },
      ExportDefaultDeclaration(node) {
        const { declaration } = node

        if (
          isDefineAcmeConfig(declaration) ||
          (declaration.type === 'Identifier' &&
            acmeConfigNames.has(declaration.name))
        ) {
          return
        }

        context.report({ messageId: 'defineAcmeConfig', node: declaration })
      },
    }
  },
  meta: {
    docs: {
      description:
        'Require `defineAcmeConfig` for the default export of an oxlint config.',
    },
    messages: {
      defineAcmeConfig:
        "Export `defineAcmeConfig({ ... })` from '@acme/oxlint-config/define.ts', or re-export '@acme/oxlint-config'. A plain `defineConfig` drops the presets' `env` and `settings`.",
    },
    type: 'problem',
  },
})
