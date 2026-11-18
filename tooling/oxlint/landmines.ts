import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: [
    {
      name: 'landmines-testing',
      specifier: '@interfere/landmines/testing',
    },
    {
      name: 'landmines-structure',
      specifier: '@interfere/landmines/structure',
    },
  ],
  rules: {
    'landmines-testing/no-fixed-sleep': 'error',
    'landmines-testing/no-flake-masking': 'error',
    'landmines-testing/no-test-doubles': 'error',
    'landmines-testing/no-unsignaled-poll': 'error',
    'landmines-testing/strict-msw': 'error',
    'landmines-structure/colocated-tests': 'error',
    'landmines-structure/package-exports': 'error',
  },
})
