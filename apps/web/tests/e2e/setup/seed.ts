import { db } from '@acme/db'

import { ROLES, TEST_EMAILS } from '../fixtures/auth'

// Data shared by every test. Keep it to what all tests need (the role users);
// tests create anything else themselves, with unique names.
export const seedUsers = async () => {
  await db.user.createMany({
    data: ROLES.map((role) => ({ email: TEST_EMAILS[role] })),
  })
}
