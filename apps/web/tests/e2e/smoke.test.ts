import { expect } from '@playwright/test'

import { env } from '~/env'
import { test } from './app-fixture'

test('go to /', async ({ page }) => {
  await page.goto('/')

  await page.waitForSelector(`text=${env.NEXT_PUBLIC_APP_NAME}`)
})

test('test 404', async ({ page }) => {
  const res = await page.goto('/not-found')
  expect(res?.status()).toBe(404)
})
