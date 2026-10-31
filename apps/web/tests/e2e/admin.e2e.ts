import { expect, test } from '@playwright/test'

import { ROLES, roleTag, TEST_EMAILS } from './fixtures/auth'

// Untagged tests run signed out (`unauthenticated` project).
test('redirects signed-out visitors to sign-in', async ({ page }) => {
  await page.goto('/admin')

  await expect(page).toHaveURL(/\/sign-in/u)
})

// Tagged tests run with that role's minted session; no login steps needed.
test.describe('user', { tag: roleTag('user') }, () => {
  test('shows the admin page', async ({ page }) => {
    await page.goto('/admin')

    await expect(page.getByText('This is the root admin page')).toBeVisible()
  })
})

// One describe per role: each runs in its own project with its own session.
for (const role of ROLES) {
  test.describe(role, { tag: roleTag(role) }, () => {
    test('shows the signed-in email in the account menu', async ({ page }) => {
      await page.goto('/admin')
      await page.getByRole('navigation').getByRole('button').click()

      await expect(page.getByText(TEST_EMAILS[role])).toBeVisible()
    })
  })
}
