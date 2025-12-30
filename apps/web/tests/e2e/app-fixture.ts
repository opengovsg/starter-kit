import { test as baseTest } from '@playwright/test'

import {
  applyMigrations,
  resetDbToSnapshot,
  startDatabase,
  takeDbSnapshot,
} from './setup/db-setup'

interface DatabaseFixture {
  databaseContainer: Awaited<ReturnType<typeof startDatabase>>
  resetDatabase: () => Promise<void>
}

const test = baseTest.extend<DatabaseFixture>({
  // eslint-disable-next-line no-empty-pattern
  databaseContainer: async ({}, use) => {
    const container = await startDatabase()

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(container)
  },

  resetDatabase: async ({ databaseContainer }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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

test.afterAll(async ({ databaseContainer }) => {
  await databaseContainer.container.stop()
})

test.afterEach(async ({ resetDatabase }) => {
  await resetDatabase()
})

export { test }
