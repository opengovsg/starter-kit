import { randomUUID } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPostgresConnectionString } from '@opengovsg/testcontainers'
import { PrismaPg } from '@prisma/adapter-pg'
import { inject } from 'vitest'

import { PrismaClient } from '@acme/db/client'

const { postgres: container } = inject('testcontainers')

if (!container) {
  throw new Error('postgres container not provided by global-setup.ts')
}

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

const prismaMigrationDir = path.join(
  fileURLToPath(path.dirname(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  'packages',
  'db',
  'prisma',
  'migrations'
)

const applyMigrations = async (client: PrismaClient) => {
  const directory = readdirSync(prismaMigrationDir).toSorted()

  for (const file of directory) {
    const name = `${prismaMigrationDir}/${file}`

    if (statSync(name).isDirectory()) {
      const migration = readFileSync(`${name}/migration.sql`, 'utf-8')
      // oxlint-disable-next-line eslint/no-await-in-loop -- migrations must run sequentially
      await client.$executeRawUnsafe(migration)
    }
  }
}

const client = await setupTestClient()

await client.$connect()

await applyMigrations(client)

await client.$disconnect()

process.env.DATABASE_URL = connectionString

Reflect.deleteProperty(globalThis, 'prisma')
