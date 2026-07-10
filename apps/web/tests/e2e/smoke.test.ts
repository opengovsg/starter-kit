import { expect, test } from '@playwright/test'

// Deliberately not `~/env`: the smoke suite also runs against deployed Vercel
// previews, where the runner has no server env. Falls back to the schema
// default for NEXT_PUBLIC_APP_NAME; set the var when the app is renamed.
// oxlint-disable-next-line no-restricted-properties
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Starter Kit'

test('go to /', async ({ page }) => {
  await page.goto('/')

  await page.waitForSelector(`text=${appName}`)
})

test('test 404', async ({ page }) => {
  const res = await page.goto('/not-found')
  expect(res?.status()).toBe(404)
})
