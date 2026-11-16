import { db } from '@acme/db'

export const getUserByEmail = async (email: string) =>
  await db.user.findUnique({
    select: { lastLogin: true },
    where: { email },
  })
