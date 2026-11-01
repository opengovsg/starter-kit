import { expect } from '@playwright/test'

import { getUserByEmail } from './user.db'

/** Polls, since the write can land after the UI has already moved on. */
export const expectUserLastLogin = (email: string) =>
  expect.poll(async () => {
    const user = await getUserByEmail(email)

    return user?.lastLogin ?? null
  })
