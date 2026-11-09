import { defineConfig } from 'oxlint'

/**
 * e18e performance/modernization rules via Oxlint's JS plugin bridge.
 * Not registered in ultracite's selectJsPlugins, so the plugin is wired here.
 *
 * @see https://e18e.dev/docs/
 */
export const e18e = defineConfig({
  jsPlugins: [{ name: 'e18e', specifier: '@e18e/eslint-plugin' }],
})
