/**
 * Test Database Setup
 *
 * This file sets up isolated test databases for each test run using Testcontainers.
 * The setup process involves:
 * 1. Creating a unique test database for each test run
 * 2. Importing the pre-exported schema (from export_schema.sh) for fast setup
 * 3. Configuring Prisma client to use the test database
 *
 * This approach ensures test isolation and faster test execution compared to
 * running migrations during test setup.
 *
 * See README.md for documentation on the schema export process.
 */

import { randomUUID } from 'crypto'
import { readdirSync, readFileSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import {
  getContainer,
  getPostgresConnectionString,
} from '@opengovsg/testcontainers'
import { PrismaPg } from '@prisma/adapter-pg'
import { vi } from 'vitest'

import { PrismaClient } from '@acme/db/client'
import { kyselyPrismaExtension } from '@acme/db/extensions'

const container = getContainer('postgres')

const originalConnectionString = getPostgresConnectionString(container)

const testSpecificDb = randomUUID()
const connectionString = getPostgresConnectionString(container, {
  database: testSpecificDb,
})

const setupTestClient = async () => {
  const _pool = new PrismaPg({ connectionString: originalConnectionString })
  const _pgClient = new PrismaClient({
    adapter: _pool,
  })
  await _pgClient.$connect()
  await _pgClient.$executeRawUnsafe(`CREATE DATABASE "${testSpecificDb}";`)
  await _pgClient.$disconnect()

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
  return client
}

const prismaMigrationDir = join(
  fileURLToPath(dirname(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'packages',
  'db',
  'prisma',
  'migrations'
)

// Running migrations manually; if using `dd-trace`, it intercepts `exec` usage and prevents runs
const applyMigrations = async (client: PrismaClient) => {
  const directory = readdirSync(prismaMigrationDir).sort()
  for (const file of directory) {
    const name = `${prismaMigrationDir}/${file}`
    if (statSync(name).isDirectory()) {
      const migration = readFileSync(`${name}/migration.sql`, 'utf8')
      await client.$executeRawUnsafe(migration)
    }
  }
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
}).$extends(kyselyPrismaExtension)

vi.mock('@acme/db', () => ({
  db,
}))

// Set up the test database
const client = await setupTestClient()
await client.$connect()
await applyMigrations(client)
await client.$disconnect()
