import { db } from '@acme/db'

import type { Prisma } from '@acme/db/client'

export const resetTables = async (tableNames: Prisma.ModelName[]) => {
  await Promise.all(
    tableNames.map(async (tableName) => {
      // TRUNCATE is faster than DELETE and resets auto-increment counters
      await db.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`)
    })
  )
}
