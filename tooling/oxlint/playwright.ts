import playwright from 'eslint-plugin-playwright'

import { pluginRuleNamesAtError } from '@acme/oxlint-config/plugin-rules.ts'

export const playwrightJsPlugins = [
  { name: 'playwright', specifier: 'eslint-plugin-playwright' },
]

/** Empty restrict maps, fixture/title fights, and matcher-style extras. */
const playwrightSkip = new Set([
  'playwright/max-expects',
  'playwright/no-hooks',
  'playwright/no-restricted-locators',
  'playwright/no-restricted-matchers',
  'playwright/no-restricted-roles',
  'playwright/no-template-literal-title',
  'playwright/prefer-comparison-matcher',
  'playwright/prefer-ending-with-an-expect',
  'playwright/prefer-equality-matcher',
  'playwright/prefer-lowercase-title',
  'playwright/prefer-strict-equal',
  'playwright/prefer-to-be',
  'playwright/prefer-to-contain',
  'playwright/require-annotation-reason',
  'playwright/require-hook',
  'playwright/require-soft-assertions',
  'playwright/require-tags',
  'playwright/require-to-throw-message',
  'playwright/require-top-level-describe',
])

export const playwrightE2eRules = pluginRuleNamesAtError(
  'playwright/',
  Object.keys(playwright.rules ?? {}),
  playwrightSkip
)

if (Object.keys(playwrightE2eRules).length === 0) {
  throw new Error(
    'eslint-plugin-playwright produced no playwright/* rules after skip'
  )
}
