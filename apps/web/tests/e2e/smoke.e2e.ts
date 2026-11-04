import { expect, test } from '@playwright/test'

import { env } from '~/env'

test('go to /', async ({ page }) => {
  await page.goto('/')

  await page.waitForSelector(`text=${env.NEXT_PUBLIC_APP_NAME}`)
})

test('test 404', async ({ page }) => {
  const res = await page.goto('/not-found')

  if (res === null) {
    throw new Error('Expected a response from /not-found')
  }

  expect(res.status()).toBe(404)
})
