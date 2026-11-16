import { db } from '@acme/db'

import { ROLES, TEST_EMAILS } from '../fixtures/auth'

export const seedUsers = async () => {
  await db.user.createMany({
    data: ROLES.map((role) => ({ email: TEST_EMAILS[role] })),
  })
}
