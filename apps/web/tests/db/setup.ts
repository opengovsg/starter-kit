/* eslint-disable no-restricted-properties */
/* eslint-disable turbo/no-undeclared-env-vars */
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
import { PrismaPg } from '@prisma/adapter-pg'
import { parse } from 'superjson'
import { vi } from 'vitest'

import { PrismaClient } from '@acme/db/client'
import { kyselyPrismaExtension } from '@acme/db/extensions'

import { CONTAINER_INFORMATION_SCHEMA } from '../common'

const parsed = CONTAINER_INFORMATION_SCHEMA.parse(
  parse(process.env.testcontainers ?? ''),
)
const container = parsed.find((c) => c.configuration.name === 'database')

if (!container) {
  console.log('cannot find container')
  throw new Error('Cannot find container')
}

const { host, ports, configuration } = container
const port = ports.get(5432) ?? 5432
const username = configuration.environment?.POSTGRES_USER ?? 'root'
const password = configuration.environment?.POSTGRES_PASSWORD ?? 'root'
const databaseId = configuration.environment?.POSTGRES_DB ?? 'test'

const originalConnectionString = `postgresql://${username}:${password}@${host}:${port}/${databaseId}?sslmode=disable`

const testSpecificDb = randomUUID()
const connectionString = `postgresql://${username}:${password}@${host}:${port}/${testSpecificDb}?sslmode=disable`

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
  'migrations',
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
