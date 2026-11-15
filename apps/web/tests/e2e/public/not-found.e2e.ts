import { expect, test } from '@playwright/test'

import { NotFoundPO } from './not-found.po'

test('shows the 404 page for an unknown route', async ({ page }) => {
  const notFound = new NotFoundPO(page)
  const res = await notFound.goto('/not-found')
  expect(res?.status()).toBe(404)
  await notFound.expectShown()
})
