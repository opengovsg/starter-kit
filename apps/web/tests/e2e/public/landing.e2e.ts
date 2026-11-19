import { test } from '~tests/e2e/test'

test('shows the landing page', async ({ landing }) => {
  await landing.goto()
  await landing.expectLoaded()
})
