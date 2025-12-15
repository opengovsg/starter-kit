import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'
import kyselyExtension from 'prisma-extension-kysely'

import type { DB } from './generated/kysely/types'

// Used for extending other Prisma clients (like testing clients) with Kysely
export const kyselyPrismaExtension = kyselyExtension({
  kysely: (driver) =>
    new Kysely<DB>({
      dialect: {
        createAdapter: () => new PostgresAdapter(),
        createDriver: () => driver,
        createIntrospector: (db) => new PostgresIntrospector(db),
        createQueryCompiler: () => new PostgresQueryCompiler(),
      },
    }),
})
