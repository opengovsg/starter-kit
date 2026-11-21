import { configs } from 'eslint-plugin-regexp'
import { defineConfig } from 'oxlint'

/**
 * RegExp lint via Oxlint's JS plugin bridge. Ultracite has no regexp preset.
 * Recommended at **error**; the plugin ships some of these as warn.
 *
 * @see https://github.com/ota-meshi/eslint-plugin-regexp
 */
export const regexpJsPlugins = [
  { name: 'regexp', specifier: 'eslint-plugin-regexp' },
]

const regexpRulesAtError = (
  rules: Record<string, unknown>
): Record<string, 'error'> =>
  Object.fromEntries(
    Object.keys(rules)
      .filter((rule) => rule.startsWith('regexp/'))
      .map((rule) => [rule, 'error'] as const)
  )

export const regexpRules = regexpRulesAtError(configs.recommended.rules)

if (Object.keys(regexpRules).length === 0) {
  throw new Error('eslint-plugin-regexp recommended produced no regexp/* rules')
}

export const regexp = defineConfig({
  jsPlugins: [...regexpJsPlugins],
  rules: regexpRules,
})
