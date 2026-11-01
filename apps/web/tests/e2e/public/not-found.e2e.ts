import { expect, test } from '@playwright/test'

import { NotFoundPO } from './not-found.po'

test('shows the 404 page for an unknown route', async ({ page }) => {
  // Arrange
  const notFound = new NotFoundPO(page)

  // Act
  const res = await notFound.goto('/not-found')

  // Assert
  expect(res?.status()).toBe(404)
  await notFound.expectShown()
})
