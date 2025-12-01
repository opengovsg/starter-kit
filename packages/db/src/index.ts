import { PrismaPg } from '@prisma/adapter-pg'
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'
import kyselyExtension from 'prisma-extension-kysely'

import type { DB } from './generated/kysely/types'
import { env } from './env'
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrisma>
}

const createPrisma = () => {
  const pool = new PrismaPg({ connectionString: env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: pool }).$extends(
    kyselyExtension({
      kysely: (driver) =>
        new Kysely<DB>({
          dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => driver,
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
          },
        }),
    }),
  )

  return prisma
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const db = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// This export is needed to avoid the TypeScript error:
// The inferred type of 'prisma' cannot be named without a reference to '../node_modules/@repo/database/src/generated/prisma'.
// This is likely not portable. A type annotation is necessary.ts(2742)
export type { Prisma, PrismaClient } from './generated/prisma/client'
