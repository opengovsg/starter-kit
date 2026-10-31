import { expect, test } from '@playwright/test'

import { env } from '~/env'

test('go to /', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('contentinfo').getByText(env.NEXT_PUBLIC_APP_NAME)
  ).toBeVisible()
})

test('unknown route returns 404', async ({ page }) => {
  const response = await page.goto('/not-found')

  expect(response).not.toBeNull()
  expect(response?.status()).toBe(404)
})
