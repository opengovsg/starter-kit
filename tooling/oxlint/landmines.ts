import { defineConfig } from 'oxlint'
import landmines from 'ultracite/oxlint/landmines'

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
