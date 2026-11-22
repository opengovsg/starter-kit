import { defineConfig } from 'oxlint'

/**
 * Repo-specific rules from `./plugin`.
 * Package specifier so configs that extend this preset resolve the plugin
 * without pulling Node typings into their typecheck.
 */
export const acmeJsPlugins = [
  { name: 'acme', specifier: '@acme/oxlint-config/plugin' },
]

export const acme = defineConfig({
  jsPlugins: acmeJsPlugins,
  rules: {
    'acme/require-explicit-user-columns': 'error',
  },
})
