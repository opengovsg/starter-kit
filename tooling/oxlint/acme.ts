import { defineConfig } from 'oxlint'

/**
 * Repo-specific rules from `./plugin`.
 * Package specifier so configs that extend this preset resolve the plugin
 * without pulling Node typings into their typecheck.
 */
export const acme = defineConfig({
  jsPlugins: [{ name: 'acme', specifier: '@acme/oxlint-config/plugin' }],
  rules: {
    'acme/require-explicit-user-columns': 'error',
  },
})
