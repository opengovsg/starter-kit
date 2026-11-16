import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  getMappedPort,
  getPostgresConnectionString,
  postgres,
  setup,
} from '@opengovsg/testcontainers'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@acme/db/client'
import { env } from '~/env'

const MIGRATIONS_DIR = fileURLToPath(
  new URL('../../../../../packages/db/prisma/migrations', import.meta.url)
)

export const startDatabase = async () => {
  const [db] = await setup([
    postgres({ ports: [{ container: 5432, host: 64_321 }], reuse: true }),
  ])

  if (!db) {
    throw new Error('E2E Postgres container failed to start')
  }

  return db
}

type DatabaseContainer = Awaited<ReturnType<typeof startDatabase>>

export const assertAppUsesDatabase = (db: DatabaseContainer) => {
  const appUrl = new URL(env.DATABASE_URL)
  const expectedPort = String(getMappedPort(db, 5432))

  if (appUrl.port !== expectedPort) {
    throw new Error(
      `Refusing to run e2e: DATABASE_URL points at "${appUrl.host}${appUrl.pathname}", not the e2e container on port ${expectedPort}. Unset DATABASE_URL in your shell so .env.e2e applies.`
    )
  }
}

export const resetDatabase = async (db: DatabaseContainer) => {
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
  } finally {
    await client.$disconnect()
  }
}
