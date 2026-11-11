import { test as baseTest } from '@playwright/test'

import {
  applyMigrations,
  resetDbToSnapshot,
  startDatabase,
  takeDbSnapshot,
} from './setup/db-setup'
import { flushRedis as flushRedisFn, startRedis } from './setup/redis-setup'

interface DatabaseFixture {
  databaseContainer: Awaited<ReturnType<typeof startDatabase>>
  resetDatabase: () => Promise<void>
}

interface RedisFixture {
  redisContainer: Awaited<ReturnType<typeof startRedis>>
  flushRedis: () => Promise<void>
}

/* oxlint-disable no-empty-pattern, react-hooks/rules-of-hooks -- Playwright fixtures require empty `{}` when a worker has no deps (runtime parses destructuring); `use` is Playwright's worker callback, not React.use(). */
const test = baseTest.extend<DatabaseFixture & RedisFixture>({
  databaseContainer: async ({}, use) => {
    const container = await startDatabase()

    await use(container)
  },

  flushRedis: async ({ redisContainer }, use) => {
    await use(async () => {
      await flushRedisFn(redisContainer)
    })
  },

  redisContainer: async ({}, use) => {
    const container = await startRedis()

    await use(container)
  },

  resetDatabase: async ({ databaseContainer }, use) => {
    await use(async () => {
      await resetDbToSnapshot(databaseContainer)
    })
  },
})

test.beforeAll(async ({ databaseContainer }) => {
  await applyMigrations(databaseContainer)
  // Add more seed data here as needed before taking the snapshot
  await takeDbSnapshot(databaseContainer)
})

test.afterEach(async ({ resetDatabase, flushRedis }) => {
  await Promise.all([resetDatabase(), flushRedis()])
})

test.afterAll(async ({ databaseContainer, redisContainer }) => {
  await Promise.all([
    databaseContainer.container.stop(),
    redisContainer.container.stop(),
  ])
})

export { test }
