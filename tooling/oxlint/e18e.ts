import { defineConfig } from 'oxlint'

/**
 * e18e performance/modernization rules via Oxlint's JS plugin bridge.
 * Not registered in ultracite's selectJsPlugins — wire jsPlugins explicitly.
 *
 * @see https://e18e.dev/docs/
 */
export const e18eJsPlugins = [
  { name: 'e18e', specifier: '@e18e/eslint-plugin' },
] as const

export const e18e = defineConfig({
  jsPlugins: [...e18eJsPlugins],
})
