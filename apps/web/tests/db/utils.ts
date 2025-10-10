import { db } from '@acme/db'

export const resetTables = async (tableNames: string[]) => {
  for (const tableName of tableNames) {
    // TRUNCATE is faster than DELETE and resets auto-increment counters
    await db.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`)
  }
}
