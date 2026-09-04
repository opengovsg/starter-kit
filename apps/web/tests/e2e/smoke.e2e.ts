import { expect } from '@playwright/test'

import { test as e2eTest } from './app-fixture'

import { env } from '~/env'

e2eTest('go to /', async ({ page }) => {
  await page.goto('/')

  await page.waitForSelector(`text=${env.NEXT_PUBLIC_APP_NAME}`)
})

e2eTest('test 404', async ({ page }) => {
  const res = await page.goto('/not-found')
  if (res === null) {
    throw new Error('Expected a response from /not-found')
  }
  expect(res.status()).toBe(404)
})
