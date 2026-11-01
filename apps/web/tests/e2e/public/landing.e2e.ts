import { test } from '@playwright/test'

import { LandingPO } from './landing.po'

test('shows the landing page', async ({ page }) => {
  // Arrange
  const landing = new LandingPO(page)

  // Act
  await landing.goto()

  // Assert
  await landing.expectLoaded()
})
