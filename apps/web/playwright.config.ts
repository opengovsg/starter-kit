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
    command: 'pnpm dev-e2e',
    url: baseUrl,
    reuseExistingServer: !process.env.CI, // Reuses the server locally, but starts a new one in CI
  },
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
  },
  testDir: './tests/e2e',
  fullyParallel: false,
  outputDir: './tests/e2e/test-results',
  // 'github' for GitHub Actions CI to generate annotations, plus a concise 'dot'
  // default 'list' when running locally
  reporter: process.env.CI ? 'github' : 'list',
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
