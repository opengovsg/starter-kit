import { db } from '@acme/db'

import type { Prisma } from '@acme/db/client'

export const resetTables = async (tableNames: Prisma.ModelName[]) => {
  await Promise.all(
    tableNames.map(
      async (tableName) =>
        await db.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`)
    )
  )
}
