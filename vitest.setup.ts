import { vi } from 'vitest'
import { makePgliteClient, applyMigrations } from '~/server/prisma/pglite'

const { client, prisma } = makePgliteClient()

vi.mock('./src/server/prisma', () => ({
  prisma,
}))

const resetDb = async () => {
  try {
    await client.exec(`DROP SCHEMA public CASCADE`)
    await client.exec(`CREATE SCHEMA public`)
  } catch (error) {
    console.log({ error })
  }
}

// Apply migrations before each test
beforeEach(async () => {
  await applyMigrations(client)
})

// Clean up the database after each test
afterEach(async () => {
  await resetDb()
})
