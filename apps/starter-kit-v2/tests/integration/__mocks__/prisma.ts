import { PrismaClient } from '@prisma/client'

import { getDatabaseUrl, hash, integreSQL } from '../helpers/hooks'

// Run before every parallel test suite for a fresh database per suite.
// Remember to still clean up after each test suite.

vi.mock('~/server/prisma', async () => {
  const testDb = await integreSQL.getTestDatabase(hash)
  const connUrl = await getDatabaseUrl(testDb)
  return {
    prisma: new PrismaClient({
      datasources: { db: { url: connUrl } },
    }),
  }
})
