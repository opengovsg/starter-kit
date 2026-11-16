import { expect } from '@playwright/test'

import { getUserByEmail } from './user.db'

export const expectUserLastLogin = async (email: string) => {
  const user = await getUserByEmail(email)
  expect(user?.lastLogin).toBeInstanceOf(Date)
}
