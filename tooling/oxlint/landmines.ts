import { defineConfig } from 'oxlint'
import landmines from 'ultracite/oxlint/landmines'

import { pluginRulesAtError } from '@acme/oxlint-config/plugin-rules.ts'

const landminesTestingJsPlugins = landmines.jsPlugins.filter(
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

export const landminesTestingRules = Object.fromEntries(
  Object.entries(
    pluginRulesAtError('landmines-testing/', landmines.rules)
  ).filter(
    ([rule]) =>
      rule === 'landmines-testing/no-fixed-sleep' ||
      rule === 'landmines-testing/no-flake-masking' ||
      rule === 'landmines-testing/no-unsignaled-poll'
  )
)

if (Object.keys(landminesTestingRules).length !== 3) {
  throw new Error(
    'ultracite/oxlint/landmines is missing the landmines-testing steal'
  )
}

export default defineConfig({
  overrides: [
    {
      files: [...landminesTestingFiles],
      jsPlugins: [...landminesTestingJsPlugins],
      rules: landminesTestingRules,
    },
  ],
})
