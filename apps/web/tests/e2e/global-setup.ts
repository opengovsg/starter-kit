/**
 * Runs once per `playwright test` invocation, after `webServer` has started
 * (the app connects to Postgres/Redis lazily, so it boots before they exist).
 *
 * State is reset per run, not per test: tests run fully in parallel, so each
 * test creates its own uniquely named data instead of relying on a clean DB.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  getMappedPort,
  getPostgresConnectionString,
  postgres,
  redis,
  setup,
} from '@opengovsg/testcontainers'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@acme/db/client'
import { env } from '~/env'

const MIGRATIONS_DIR = fileURLToPath(
  new URL('../../../../packages/db/prisma/migrations', import.meta.url)
)

const startContainers = async () => {
  const [db, cache] = await setup([
    // Host ports must match .env.e2e. `reuse` keeps containers warm across local runs.
    postgres({ ports: [{ container: 5432, host: 64_321 }], reuse: true }),
    redis({ ports: [{ container: 6379, host: 63_799 }], reuse: true }),
  ])

  if (!db || !cache) {
    throw new Error('E2E containers failed to start')
  }

  return { cache, db }
}

type DatabaseContainer = Awaited<ReturnType<typeof startContainers>>['db']

// dotenv does not override variables already set in the shell, so an exported
// dev DATABASE_URL would silently point the app server at the dev database
// while this setup resets the container, and tests would then write dev data.
const assertAppUsesContainer = (db: DatabaseContainer) => {
  const appUrl = new URL(env.DATABASE_URL)
  const expectedPort = String(getMappedPort(db, 5432))

  if (appUrl.port !== expectedPort) {
    throw new Error(
      `Refusing to run e2e: DATABASE_URL points at "${appUrl.host}${appUrl.pathname}", not the e2e container on port ${expectedPort}. Unset DATABASE_URL in your shell so .env.e2e applies.`
    )
  }
}

// Drop and re-create the schema rather than truncating, so a reused container
// always matches the current migrations. Migrations are applied as raw SQL
// because dd-trace intercepts `exec` and would block `prisma migrate`.
const resetDatabase = async (db: DatabaseContainer) => {
  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: getPostgresConnectionString(db),
    }),
  })

  try {
    await client.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE')
    await client.$executeRawUnsafe('CREATE SCHEMA public')

    for (const migration of readdirSync(MIGRATIONS_DIR).toSorted()) {
      const dir = `${MIGRATIONS_DIR}/${migration}`

      if (statSync(dir).isDirectory()) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- migrations must run sequentially
        await client.$executeRawUnsafe(
          readFileSync(`${dir}/migration.sql`, 'utf-8')
        )
      }
    }
    // Seed data shared by every test goes here.
  } finally {
    await client.$disconnect()
  }
}

const flushRedis = async (
  cache: Awaited<ReturnType<typeof startContainers>>['cache']
) => {
  const result = await cache.container.exec(['redis-cli', 'FLUSHALL'])

  if (result.exitCode !== 0) {
    throw new Error(`Failed to flush Redis: ${result.output}`)
  }
}

const globalSetup = async () => {
  const { cache, db } = await startContainers()
  assertAppUsesContainer(db)
  await Promise.all([resetDatabase(db), flushRedis(cache)])
}

export default globalSetup
