import { expect, test } from '@playwright/test'

import { ROLES, roleTag, TEST_EMAILS } from '../fixtures/auth'
import { AdminPO } from './admin.po'

const signInUrl = /\/sign-in/u

// Untagged tests run signed out (`unauthenticated` project).
test('redirects signed-out visitors to sign-in', async ({ page }) => {
  const admin = new AdminPO(page)
  await admin.goto()
  await expect(page).toHaveURL(signInUrl)
})

// Tagged tests run with that role's minted session; no login steps needed.
test.describe('user', { tag: roleTag('user') }, () => {
  test('shows the admin page', async ({ page }) => {
    const admin = new AdminPO(page)
    await admin.goto()
    await admin.expectLoaded()
  })
})

// One describe per role: each runs in its own project with its own session.
for (const role of ROLES) {
  test.describe(role, { tag: roleTag(role) }, () => {
    test('shows the signed-in email in the account menu', async ({ page }) => {
      const admin = new AdminPO(page)
      await admin.goto()
      await admin.openAccountMenu()
      await admin.expectSignedInAs(TEST_EMAILS[role])
    })
  })
}
