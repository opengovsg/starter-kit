import { expect } from '@playwright/test'
import { ROLES, roleTag, TEST_EMAILS } from '~tests/e2e/helpers/auth'
import { test } from '~tests/e2e/test'

const signInUrl = /\/sign-in/u

test('redirects signed-out visitors to sign-in', async ({ admin, page }) => {
  await admin.goto()
  await expect(page).toHaveURL(signInUrl)
})

test.describe('user', { tag: roleTag('user') }, () => {
  test('shows the admin page', async ({ admin }) => {
    await admin.goto()
    await admin.expectLoaded()
  })
})

for (const role of ROLES) {
  test.describe(role, { tag: roleTag(role) }, () => {
    test('shows the signed-in email in the account menu', async ({ admin }) => {
      await admin.goto()
      await admin.openAccountMenu()
      await admin.expectSignedInAs(TEST_EMAILS[role])
    })
  })
}
