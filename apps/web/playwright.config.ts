import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(__dirname, '.env.e2e'), quiet: true })

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3111'
console.log(`ℹ️ Using base URL "${baseUrl}"`)

const opts = {
  // launch headless on CI, in browser locally
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS,
}

export default defineConfig({
  webServer: {
    // CI tests the production build (built by `pnpm build-e2e` in ci.yml).
    command: process.env.CI ? 'pnpm start-e2e' : 'pnpm dev-e2e',
    url: baseUrl,
    reuseExistingServer: !process.env.CI, // Reuses the server locally, but starts a new one in CI
  },
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: baseUrl,
    // No retries are configured, so keep traces/videos of failures instead of
    // 'on-first-retry' (which would never record anything).
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  // Tests create their own uniquely named data, so they can run in parallel.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  outputDir: './tests/e2e/test-results',
  // 'github' alone only emits failure annotations; 'list' adds a line per test.
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: baseUrl,
        headless: opts.headless,
      },
    },
  ],
})
