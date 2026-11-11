/**
 * Playwright e2e lint via Oxlint's JS plugin bridge. Ultracite has no Playwright
 * preset. Consumed only from the apps/web `tests/e2e/**` override — not Vitest.
 *
 * Recommended (eslint-plugin-playwright 2.12.2) at **error**; the plugin ships
 * many of these as warn. Extras vs recommended, adopted from ComfyUI only
 * where this kit benefits:
 * - `prefer-native-locators`: OUI/React Aria is role- and name-driven.
 * - `require-to-pass-timeout`: `toPass()` defaults to timeout 0 (retry until
 *   the test timeout).
 * Skipped: ComfyUI's `no-force-option: off` (no canvas `{ force: true }` here).
 *
 * @see https://github.com/mskelton/eslint-plugin-playwright
 */
export const playwrightJsPlugins = [
  { name: 'playwright', specifier: 'eslint-plugin-playwright' },
]

export const playwrightE2eRules = {
  'playwright/consistent-spacing-between-blocks': 'error',
  'playwright/expect-expect': 'error',
  'playwright/max-nested-describe': 'error',
  'playwright/missing-playwright-await': 'error',
  'playwright/no-conditional-expect': 'error',
  'playwright/no-conditional-in-test': 'error',
  'playwright/no-duplicate-hooks': 'error',
  'playwright/no-duplicate-slow': 'error',
  'playwright/no-element-handle': 'error',
  'playwright/no-eval': 'error',
  'playwright/no-focused-test': 'error',
  'playwright/no-force-option': 'error',
  'playwright/no-identical-title': 'error',
  'playwright/no-nested-step': 'error',
  'playwright/no-networkidle': 'error',
  'playwright/no-page-pause': 'error',
  'playwright/no-skipped-test': 'error',
  'playwright/no-standalone-expect': 'error',
  'playwright/no-unnecessary-assertions': 'error',
  'playwright/no-unsafe-references': 'error',
  'playwright/no-unused-locators': 'error',
  'playwright/no-useless-await': 'error',
  'playwright/no-useless-not': 'error',
  'playwright/no-wait-for-navigation': 'error',
  'playwright/no-wait-for-selector': 'error',
  'playwright/no-wait-for-timeout': 'error',
  'playwright/prefer-hooks-in-order': 'error',
  'playwright/prefer-hooks-on-top': 'error',
  'playwright/prefer-locator': 'error',
  'playwright/prefer-native-locators': 'error',
  'playwright/prefer-to-have-count': 'error',
  'playwright/prefer-to-have-length': 'error',
  'playwright/prefer-web-first-assertions': 'error',
  'playwright/require-to-pass-timeout': 'error',
  'playwright/valid-describe-callback': 'error',
  'playwright/valid-expect': 'error',
  'playwright/valid-expect-in-promise': 'error',
  'playwright/valid-test-tags': 'error',
  'playwright/valid-title': 'error',
} as const
