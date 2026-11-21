import { defineConfig } from 'oxlint'

/**
 * Interfere landmines **testing** plugin only. Do not extend
 * `ultracite/oxlint/landmines` — that preset turns on all ten rules
 * (comments, file names, no-test-doubles, strict-msw, return types)
 * which fight this kit’s Testcontainers harness, `__tests__/` + `*.e2e.ts`
 * layout, and Storybook MSW.
 *
 * Vitest configs are in this glob so `no-flake-masking` can catch
 * `retry` / `testTimeout` there. Shared ignorePatterns still skip
 * `*.config.*` files until that ignore is narrowed; `retry: 0` is
 * omitted because Vitest’s default is already 0.
 *
 * @see https://github.com/interfere-inc/landmines
 */
export const landminesTestingJsPlugins = [
  { name: 'landmines-testing', specifier: '@interfere/landmines/testing' },
]

export const landminesTestingFiles = [
  '**/*.{test,spec,e2e}.*',
  '**/__tests__/**',
  '**/vitest.config.*',
] as const

export const landminesTestingRules = {
  'landmines-testing/no-fixed-sleep': 'error',
  'landmines-testing/no-flake-masking': 'error',
  'landmines-testing/no-unsignaled-poll': 'error',
} as const

export default defineConfig({
  overrides: [
    {
      files: [...landminesTestingFiles],
      jsPlugins: [...landminesTestingJsPlugins],
      rules: landminesTestingRules,
    },
  ],
})
