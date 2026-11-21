import { defineConfig } from 'oxlint'
import landmines from 'ultracite/oxlint/landmines'

/**
 * Ultracite 8.3 `ultracite/oxlint/landmines` **testing** plugin only.
 * Do not `extends` that preset — it turns on all ten rules (comments, file
 * names, no-test-doubles, strict-msw, return types) which fight this kit’s
 * Testcontainers harness, `__tests__/` + `*.e2e.ts` layout, and Storybook MSW.
 *
 * The preset is built into Ultracite; the JS plugin is not (unlike anti-slop).
 * `@interfere/landmines` is a **non-catalog** dep of this package so oxlint
 * can resolve `@interfere/landmines/testing`. Do not add it to the workspace
 * catalog or to app packages.
 *
 * Vitest configs are in this glob so `no-flake-masking` can catch `retry` /
 * `testTimeout` there. Shared ignorePatterns still skip `*.config.*` files
 * until that ignore is narrowed; `retry: 0` is omitted because Vitest’s
 * default is already 0.
 *
 * @see https://www.ultracite.ai/docs/provider/oxlint
 */
const landminesTestingJsPlugins = (landmines.jsPlugins ?? []).filter(
  (plugin) => plugin.name === 'landmines-testing'
)

if (landminesTestingJsPlugins.length === 0) {
  throw new Error(
    'ultracite/oxlint/landmines is missing the landmines-testing plugin'
  )
}

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
