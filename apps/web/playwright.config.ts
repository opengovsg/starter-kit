import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

import { ROLES, storageStateFor } from './tests/e2e/fixtures/auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(__dirname, '.env.e2e'), quiet: true })

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3111'
console.log(`ℹ️ Using base URL "${baseUrl}"`)

const opts = {
  // launch headless on CI, in browser locally
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS,
}

const baseUse = {
  ...devices['Desktop Chrome'],
  baseURL: baseUrl,
  headless: opts.headless,
}

export default defineConfig({
  webServer: {
    command: process.env.CI ? 'pnpm start-e2e' : 'pnpm dev-e2e',
    url: baseUrl,
    reuseExistingServer: !process.env.CI, // Reuses the server locally, but starts a new one in CI
  },
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: baseUrl,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  outputDir: './tests/e2e/test-results',
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  projects: [
    { name: 'unauthenticated', grepInvert: /@role:/u, use: baseUse },
    ...ROLES.flatMap((role) => {
      const grep = new RegExp(`@role:${role}\\b`, 'u')

      return [
        {
          name: `setup:${role}`,
          testMatch: /auth\.setup\.ts$/u,
          grep,
          use: baseUse,
        },
        {
          name: role,
          grep,
          dependencies: [`setup:${role}`],
          use: { ...baseUse, storageState: storageStateFor(role) },
        },
      ]
    }),
  ],
})
