import { expect } from '@playwright/test'

import { getUserByEmail } from './user.db'

/** Polls, since the write can land after the UI has already moved on. */
export const expectUserLastLogin = (email: string) =>
  // Matcher is chained at the call site (e.g. `.toBeInstanceOf(Date)`).
  // oxlint-disable-next-line playwright/valid-expect -- wrapper returns expect.poll for the test to chain a matcher
  expect.poll(async () => {
    const user = await getUserByEmail(email)

    return user?.lastLogin ?? null
  })
