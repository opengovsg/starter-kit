import { ROLES, TEST_EMAILS } from '~tests/e2e/helpers/auth'

import { db } from '@acme/db'

export const seedUsers = async () => {
  await db.user.createMany({
    data: ROLES.map((role) => ({ email: TEST_EMAILS[role] })),
  })
}
