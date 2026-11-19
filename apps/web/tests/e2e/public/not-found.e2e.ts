import { expect } from '@playwright/test'
import { test } from '~tests/e2e/test'

test('shows the 404 page for an unknown route', async ({ notFound }) => {
  const res = await notFound.goto('/not-found')
  expect(res?.status()).toBe(404)
  await notFound.expectShown()
})
