import { configs } from 'eslint-plugin-regexp'
import { defineConfig } from 'oxlint'

import { pluginRulesAtError } from '@acme/oxlint-config/plugin-rules.ts'

export const regexpJsPlugins = [
  { name: 'regexp', specifier: 'eslint-plugin-regexp' },
]

export const regexpRules = pluginRulesAtError(
  'regexp/',
  configs.recommended.rules
)

if (Object.keys(regexpRules).length === 0) {
  throw new Error('eslint-plugin-regexp recommended produced no regexp/* rules')
}

export const regexp = defineConfig({
  jsPlugins: [...regexpJsPlugins],
  rules: regexpRules,
})
