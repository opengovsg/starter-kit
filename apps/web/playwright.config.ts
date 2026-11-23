/* oxlint-disable no-console -- Prints the base URL when an e2e run starts. */
import path from 'node:path'

import { defineConfig, devices } from '@playwright/test'
import { ROLES, storageStateFor } from '~tests/e2e/helpers/auth'

process.loadEnvFile(path.resolve(import.meta.dirname, '.env.e2e'))

const isCI = Boolean(process.env.CI)
const authSetupFile = /auth\.setup\.ts$/u
const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3111'

console.log(`ℹ️ Using base URL "${baseUrl}"`)

const opts = {
  // launch headless on CI, in browser locally
  headless: isCI || Boolean(process.env.PLAYWRIGHT_HEADLESS),
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS,
}

const baseUse = {
  ...devices['Desktop Chrome'],
  baseURL: baseUrl,
  headless: opts.headless,
}

export default defineConfig({
  webServer: {
    command: isCI ? 'pnpm start-e2e' : 'pnpm dev-e2e',
    url: baseUrl,
    // Reuses the server locally, but starts a new one in CI
    reuseExistingServer: !isCI,
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
  forbidOnly: isCI,
  workers: isCI ? 2 : undefined,
  outputDir: './tests/e2e/test-results',
  reporter: isCI ? [['github'], ['list']] : 'list',
  projects: [
    { name: 'unauthenticated', grepInvert: /@role:/u, use: baseUse },
    ...ROLES.flatMap((role) => {
      const grep = new RegExp(`@role:${role}\\b`, 'u')

      return [
        {
          name: `setup:${role}`,
          testMatch: authSetupFile,
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
