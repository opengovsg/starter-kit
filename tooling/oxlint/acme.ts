import { fileURLToPath } from 'node:url'

import { defineConfig } from 'oxlint'

const pluginPath = fileURLToPath(new URL('./plugin/index.ts', import.meta.url))

/** Repo-specific rules from `./plugin`. */
export const acme = defineConfig({
  jsPlugins: [{ name: 'acme', specifier: pluginPath }],
  rules: {
    'acme/require-explicit-user-columns': 'error',
  },
})
