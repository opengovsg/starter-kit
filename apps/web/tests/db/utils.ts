import { db } from '@acme/db'

import type { Prisma } from '@acme/db/client'

export const resetTables = async (tableNames: Prisma.ModelName[]) => {
  // TRUNCATE is faster than DELETE and resets auto-increment counters.
  // A single statement avoids lock contention between overlapping CASCADEs.
  const tables = tableNames.map((tableName) => `"${tableName}"`).join(', ')
  await db.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
}
