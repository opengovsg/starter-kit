import e18ePlugin from '@e18e/eslint-plugin'
import { defineConfig } from 'oxlint'

import { pluginRuleNamesAtError } from '@acme/oxlint-config/plugin-rules.ts'

const e18eCoveredByUltracite = [
  'e18e/prefer-array-at',
  'e18e/prefer-array-some',
  'e18e/prefer-date-now',
  'e18e/prefer-exponentiation-operator',
  'e18e/prefer-flatmap-over-map-flat',
  'e18e/prefer-includes',
  'e18e/prefer-nullish-coalescing',
  'e18e/prefer-object-has-own',
  'e18e/prefer-regex-test',
  'e18e/prefer-spread-syntax',
] as const

const e18eNeedsTypeChecker = ['e18e/no-indexof-equality'] as const

const e18eConflictsWithUnicornCodePoint = [
  'e18e/prefer-string-fromcharcode',
] as const

const e18eSkip = new Set<string>([
  ...e18eCoveredByUltracite,
  ...e18eNeedsTypeChecker,
  ...e18eConflictsWithUnicornCodePoint,
])

export const e18eRules = pluginRuleNamesAtError(
  'e18e/',
  Object.keys(e18ePlugin.rules ?? {}),
  e18eSkip
)

if (Object.keys(e18eRules).length === 0) {
  throw new Error('@e18e/eslint-plugin produced no e18e/* rules after skip')
}

export const e18e = defineConfig({
  jsPlugins: [{ name: 'e18e', specifier: '@e18e/eslint-plugin' }],
  rules: e18eRules,
})
