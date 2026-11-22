import { configs } from 'eslint-plugin-regexp'
import { defineConfig } from 'oxlint'

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
