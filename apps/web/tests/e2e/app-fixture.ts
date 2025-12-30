/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-empty-pattern */
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

const test = baseTest.extend<DatabaseFixture & RedisFixture>({
  databaseContainer: async ({}, use) => {
    const container = await startDatabase()

    await use(container)
  },

  resetDatabase: async ({ databaseContainer }, use) => {
    await use(async () => {
      await resetDbToSnapshot(databaseContainer)
    })
  },

  redisContainer: async ({}, use) => {
    const container = await startRedis()

    await use(container)
  },

  flushRedis: async ({ redisContainer }, use) => {
    await use(async () => {
      await flushRedisFn(redisContainer)
    })
  },
})

test.beforeAll(async ({ databaseContainer }) => {
  await applyMigrations(databaseContainer)
  // Add more seed data here as needed before taking the snapshot
  await takeDbSnapshot(databaseContainer)
})

test.afterAll(async ({ databaseContainer, redisContainer }) => {
  await Promise.all([
    databaseContainer.container.stop(),
    redisContainer.container.stop(),
  ])
})

test.afterEach(async ({ resetDatabase, flushRedis }) => {
  await Promise.all([resetDatabase(), flushRedis()])
})

export { test }
