/* oxlint-disable react-hooks/rules-of-hooks */
/* oxlint-disable no-empty-pattern */
import { test as baseTest } from '@playwright/test'

import {
  applyMigrations,
  resetDbToSnapshot,
  startDatabase,
  takeDbSnapshot,
} from './setup/db-setup'
import { flushRedis as flushRedisFn, startRedis } from './setup/redis-setup'

// When PLAYWRIGHT_TEST_BASE_URL is set, tests run against a deployed app
// (typically a Vercel preview). The testcontainers stack is then irrelevant:
// there is no local DB or Redis to manage, and the deployed server has its
// own. Tests built on this fixture need that local control, so they skip.
// oxlint-disable-next-line no-restricted-properties
const isPreviewMode = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL)

interface DatabaseFixture {
  databaseContainer: Awaited<ReturnType<typeof startDatabase>> | null
  resetDatabase: () => Promise<void>
}

interface RedisFixture {
  redisContainer: Awaited<ReturnType<typeof startRedis>> | null
  flushRedis: () => Promise<void>
}

const test = baseTest.extend<DatabaseFixture & RedisFixture>({
  databaseContainer: async ({}, use) => {
    if (isPreviewMode) {
      await use(null)
      return
    }
    const container = await startDatabase()

    await use(container)
  },

  resetDatabase: async ({ databaseContainer }, use) => {
    await use(async () => {
      if (databaseContainer) await resetDbToSnapshot(databaseContainer)
    })
  },

  redisContainer: async ({}, use) => {
    if (isPreviewMode) {
      await use(null)
      return
    }
    const container = await startRedis()

    await use(container)
  },

  flushRedis: async ({ redisContainer }, use) => {
    await use(async () => {
      if (redisContainer) await flushRedisFn(redisContainer)
    })
  },
})

// Fixture-based tests require the local stack; skip them on preview runs.
test.beforeEach(() => {
  test.skip(
    isPreviewMode,
    'Requires the local testcontainers stack; not run against deployed previews'
  )
})

test.beforeAll(async ({ databaseContainer }) => {
  if (!databaseContainer) return
  await applyMigrations(databaseContainer)
  // Add more seed data here as needed before taking the snapshot
  await takeDbSnapshot(databaseContainer)
})

test.afterAll(async ({ databaseContainer, redisContainer }) => {
  await Promise.all([
    databaseContainer?.container.stop(),
    redisContainer?.container.stop(),
  ])
})

test.afterEach(async ({ resetDatabase, flushRedis }) => {
  await Promise.all([resetDatabase(), flushRedis()])
})

export { test }
