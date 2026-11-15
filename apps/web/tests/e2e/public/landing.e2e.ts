import { test } from '@playwright/test'

import { LandingPO } from './landing.po'

test('shows the landing page', async ({ page }) => {
  const landing = new LandingPO(page)
  await landing.goto()
  await landing.expectLoaded()
})
