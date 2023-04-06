import { test, expect } from '@playwright/test'

test.setTimeout(35e3)

test('go to /', async ({ page }) => {
  await page.goto('/')

  await page.waitForSelector(`text=OGP Starter Kit`)
})

test('test 404', async ({ page }) => {
  const res = await page.goto('/not-found')
  expect(res?.status()).toBe(404)
})
