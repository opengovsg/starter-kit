import playwright from 'eslint-plugin-playwright'

import { pluginRulesAtError } from '@acme/oxlint-config/plugin-rules.ts'

export const playwrightJsPlugins = [
  { name: 'playwright', specifier: 'eslint-plugin-playwright' },
]

export const playwrightE2eRules = {
  ...pluginRulesAtError(
    'playwright/',
    playwright.configs.recommended.rules ?? {}
  ),
  'playwright/no-action-timeout': 'error',
  'playwright/no-commented-out-tests': 'error',
  'playwright/no-export': 'error',
  'playwright/no-get-by-title': 'error',
  'playwright/no-magic-timeouts': 'error',
  'playwright/no-nth-methods': 'error',
  'playwright/no-raw-locators': 'error',
  'playwright/no-slowed-test': 'error',
  'playwright/no-test-return-statement': 'error',
  'playwright/prefer-native-locators': 'error',
  'playwright/require-to-pass-timeout': 'error',
} as const

if (
  !Object.keys(playwrightE2eRules).some((rule) =>
    rule.startsWith('playwright/')
  )
) {
  throw new Error(
    'eslint-plugin-playwright recommended produced no playwright/* rules'
  )
}
