import { defineConfig } from 'oxlint'

export const acmeJsPlugins = [
  { name: 'acme', specifier: '@acme/oxlint-config/plugin' },
]

export const acme = defineConfig({
  jsPlugins: acmeJsPlugins,
  rules: {
    'acme/require-explicit-user-columns': 'error',
  },
})
