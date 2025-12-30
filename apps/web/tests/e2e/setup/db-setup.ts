/**
 * Separate file from vitest setup due to different execution context
 */
import { readdirSync, readFileSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  CONTAINER_CONFIGURATIONS,
  setup as setupContainers,
} from '~tests/common'

import { PrismaClient } from '@acme/db/client'

type DatabaseContainer = Awaited<ReturnType<typeof startDatabase>>

export const getConnectionString = (
  container: DatabaseContainer,
  internalPort?: boolean,
) => {
  const { host, ports, configuration } = container
  const port = internalPort ? 5432 : (ports.get(5432) ?? 5432)
  const username = configuration.environment?.POSTGRES_USER ?? 'root'
  const password = configuration.environment?.POSTGRES_PASSWORD ?? 'root'
  const databaseId = configuration.environment?.POSTGRES_DB ?? 'test'

  return `postgresql://${username}:${password}@${host}:${port}/${databaseId}?sslmode=disable`
}

export const startDatabase = async () => {
  const [dbContainer] = await setupContainers([
    {
      ...CONTAINER_CONFIGURATIONS.database,
      reuse: true,
      // The host port must be the same as in .env.e2e.
      ports: [{ container: 5432, host: 64321 }],
    },
  ])

  if (!dbContainer) {
    throw new Error('Database container not started')
  }

  return dbContainer
}

export const applyMigrations = async (container: DatabaseContainer) => {
  const connectionString = getConnectionString(container)
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
    'migrations',
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
      `pg_dump -d ${getConnectionString(
        container,
        true,
      )} -Fc -f /tmp/snapshot.dump`,
    ],
    { user: 'root' },
  )

  if (snapshotResult.exitCode !== 0) {
    console.error(
      'Failed when trying to take a snapshot of the db',
      snapshotResult,
    )
  } else {
    console.log('Database snapshot taken')
  }
}

export async function resetDbToSnapshot(container: DatabaseContainer) {
  const resetResult = await container.container.exec([
    'sh',
    '-c',
    `pg_restore --clean --if-exists -d ${getConnectionString(
      container,
      true,
    )} /tmp/snapshot.dump`,
  ])

  if (resetResult.exitCode !== 0) {
    console.error('Failed when trying to reset the db', resetResult)
  } else {
    console.log('Database reset to snapshot')
  }
}
