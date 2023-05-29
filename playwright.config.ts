import { type PlaywrightTestConfig, devices } from '@playwright/test'

import { loadEnvConfig } from '@next/env'

// Load environment variables just like Next.js does.
// Will load from `.env.test` due to the `NODE_ENV=test` environment variable in `test:e2e` script.
loadEnvConfig(process.cwd())

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
console.log(`ℹ️ Using base URL "${baseUrl}"`)

const opts = {
  // launch headless on CI, in browser locally
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS
}
const config: PlaywrightTestConfig = {
  testDir: './playwright',
  timeout: 35e3,
  outputDir: './playwright/test-results',
  // 'github' for GitHub Actions CI to generate annotations, plus a concise 'dot'
  // default 'list' when running locally
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: baseUrl,
    headless: opts.headless,
    video: 'on',
  },
}

export default config
