import { expect, test } from '@playwright/test'
import { ROLES, roleTag, TEST_EMAILS } from '~tests/e2e/fixtures/auth'

import { AdminPO } from './admin.po'

const signInUrl = /\/sign-in/u

test('redirects signed-out visitors to sign-in', async ({ page }) => {
  const admin = new AdminPO(page)
  await admin.goto()
  await expect(page).toHaveURL(signInUrl)
})

test.describe('user', { tag: roleTag('user') }, () => {
  test('shows the admin page', async ({ page }) => {
    const admin = new AdminPO(page)
    await admin.goto()
    await admin.expectLoaded()
  })
})

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
