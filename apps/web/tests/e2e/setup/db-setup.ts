/**
 * Separate file from vitest setup due to different execution context
 */
import { readdirSync, readFileSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import {
  getPostgresConnectionString,
  postgres,
  setup,
} from '@opengovsg/starter-kitty-testcontainers'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@acme/db/client'

type DatabaseContainer = Awaited<ReturnType<typeof startDatabase>>

export const startDatabase = async () => {
  const [dbContainer] = await setup([
    postgres({
      reuse: true,
      // The host port must be the same as in .env.e2e.
      ports: [{ container: 5432, host: 64321 }],
    }),
  ])

  if (!dbContainer) {
    throw new Error('Database container not started')
  }

  return dbContainer
}

export const applyMigrations = async (container: DatabaseContainer) => {
  const connectionString = getPostgresConnectionString(container)
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })

  const prismaMigrationDir = join(
    fileURLToPath(dirname(import.meta.url)),
    '..',
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
  const directory = readdirSync(prismaMigrationDir).sort()
  for (const file of directory) {
    const name = `${prismaMigrationDir}/${file}`
    if (statSync(name).isDirectory()) {
      const migration = readFileSync(`${name}/migration.sql`, 'utf8')
      await client.$executeRawUnsafe(migration)
      console.log(`Applied migration: ${file}`)
    }
  }
}

export const setupTestClient = (connectionString: string) => {
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
  return client
}

export async function takeDbSnapshot(container: DatabaseContainer) {
  // Saving a snapshot of the database
  const snapshotResult = await container.container.exec(
    [
      'sh',
      '-c',
      `pg_dump -d ${getPostgresConnectionString(container, {
        internal: true,
      })} -Fc -f /tmp/snapshot.dump`,
    ],
    { user: 'root' }
  )

  if (snapshotResult.exitCode !== 0) {
    console.error(
      'Failed when trying to take a snapshot of the db',
      snapshotResult
    )
  } else {
    console.log('Database snapshot taken')
  }
}

export async function resetDbToSnapshot(container: DatabaseContainer) {
  const resetResult = await container.container.exec([
    'sh',
    '-c',
    `pg_restore --clean --if-exists -d ${getPostgresConnectionString(
      container,
      { internal: true }
    )} /tmp/snapshot.dump`,
  ])

  if (resetResult.exitCode !== 0) {
    console.error('Failed when trying to reset the db', resetResult)
  } else {
    console.log('Database reset to snapshot')
  }
}
