import { randomUUID } from 'node:crypto'

import { expect, test } from '@playwright/test'

import { setKnownOtp } from './fixtures/otp'

// The only test that signs in through the UI. Every other signed-in test
// reuses the session minted in global-setup.ts (see `roleTag`).
test('signs in with email OTP', async ({ page }) => {
  // Arrange
  const email = `login-flow-${randomUUID()}@e2e.gov.sg`

  // Act
  await page.goto('/sign-in')
  await page
    .getByLabel('Log in with a .gov.sg or whitelisted email address')
    .fill(email)
  await page.getByRole('button', { name: 'Get OTP' }).click()
  const otpInput = page.getByLabel(`Enter the OTP sent to ${email}`)
  await expect(otpInput).toBeVisible()
  await otpInput.fill(await setKnownOtp(email))
  await page.getByRole('button', { name: 'Log in' }).click()

  // Assert
  await expect(page).toHaveURL(/\/admin$/u)
})
