import { db } from '@acme/db'

// Read-only queries for asserting persisted state. Return rows; the `expect`
// lives in the test or in user-expect.ts.
export const getUserByEmail = async (email: string) =>
  await db.user.findUnique({
    select: { lastLogin: true },
    where: { email },
  })
