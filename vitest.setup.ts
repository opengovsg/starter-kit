import { vi } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { readdirSync, readFileSync, statSync } from 'node:fs'

const client = new PGlite()
const adapter = new PrismaPGlite(client)
const prisma = new PrismaClient({ adapter })

vi.mock('./src/server/prisma', () => ({
  prisma,
}))

export const resetDb = async () => {
  try {
    await client.exec(`DROP SCHEMA public CASCADE`)
    await client.exec(`CREATE SCHEMA public`)
  } catch (error) {
    console.log({ error })
  }
}

const applyMigrations = async () => {
  const prismaMigrationDir = './prisma/migrations'
  const directory = readdirSync(prismaMigrationDir).sort()
  for (const file of directory) {
    const name = `${prismaMigrationDir}/${file}`
    if (statSync(name).isDirectory()) {
      const migration = readFileSync(`${name}/migration.sql`, 'utf8')
      await client.exec(migration)
    }
  }
}

// Apply migrations before each test
beforeEach(async () => {
  await applyMigrations()
})

// Clean up the database after each test
afterEach(async () => {
  await resetDb()
})
