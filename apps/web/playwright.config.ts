import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The Playwright runner may import test files that transitively pull in
// `~/env` (t3-env). The runner itself only needs a couple of vars - the
// *server* it talks to validates its own env - so skip the t3-env validation
// here, decoupling the suite from the full server env schema.
process.env.SKIP_ENV_VALIDATION = '1'

// Mode selection. `PLAYWRIGHT_TEST_BASE_URL` set (CI against a deployed
// Vercel preview, or a loop pointed at any deployed URL) => preview mode: no
// local stack, hit that URL. Otherwise local mode: boot the app here.
const externalBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL
const isLocal = !externalBaseUrl

// Local mode: load this suite's own E2E env (consumed by the dev-e2e server
// Playwright spawns). Preview mode runs against a deployed app whose env is
// managed by Vercel, so nothing to load.
if (isLocal) {
  dotenv.config({ path: path.resolve(__dirname, '.env.e2e'), quiet: true })
}

const baseUrl = externalBaseUrl ?? 'http://localhost:3111'
console.log(`ℹ️ Using base URL "${baseUrl}"`)

const opts = {
  // launch headless on CI, in browser locally
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS,
}

// Vercel deployment-protection bypass (preview mode only). If the preview is
// gated, every request is blocked at Vercel's edge before reaching the app;
// attaching this header bypasses that. Configured in Vercel: Settings ->
// Deployment Protection -> Protection Bypass for Automation.
const vercelBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const extraHTTPHeaders =
  !isLocal && vercelBypass
    ? { 'x-vercel-protection-bypass': vercelBypass }
    : undefined

export default defineConfig({
  // Local mode boots the app via `dev-e2e` (Next dev on a fixed port, env
  // from `.env.e2e`). Preview mode hits a deployed URL and runs no server.
  ...(isLocal
    ? {
        webServer: {
          command: 'pnpm dev-e2e',
          url: baseUrl,
          reuseExistingServer: !process.env.CI, // Reuses the server locally, but starts a new one in CI
        },
      }
    : {}),
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    extraHTTPHeaders,
  },
  testDir: './tests/e2e',
  fullyParallel: false,
  outputDir: './tests/e2e/test-results',
  // On CI, pair 'github' (PR annotations on failures) with 'list' so the log
  // shows each test name as it runs, and write the HTML report so the
  // workflow can upload it as an artifact (otherwise outputDir is empty on a
  // passing run and there's nothing to attach). Plain 'list' locally.
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : 'list',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: baseUrl,
        headless: opts.headless,
        extraHTTPHeaders,
      },
    },
  ],
})
