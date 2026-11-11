import { randomUUID } from 'node:crypto'

import { expect, test } from '@playwright/test'

import { mockTrpcFailure } from '../fixtures/network'
import { setKnownOtp } from '../fixtures/otp'
import { expectUserLastLogin } from '../fixtures/user-expect'
import { SignInPO } from './sign-in.po'

const uniqueEmail = () => `sign-in-${randomUUID()}@e2e.gov.sg`
const adminUrl = /\/admin$/u

// The only test that signs in through the UI. Every other signed-in test
// reuses the session minted by auth.setup.ts (see `roleTag`).
test('signs in with email OTP', async ({ page }) => {
  // Arrange
  const email = uniqueEmail()
  const signIn = new SignInPO(page)
  await signIn.goto()

  // Act
  await signIn.requestOtp(email)
  await signIn.expectOtpPrompt(email)
  await signIn.submitOtp(email, await setKnownOtp(email))

  // Assert
  await expect(page).toHaveURL(adminUrl)
  await expectUserLastLogin(email).toBeInstanceOf(Date)
})

test('shows the error when requesting an OTP fails', async ({ page }) => {
  // Arrange
  const signIn = new SignInPO(page)
  await mockTrpcFailure(page, 'auth.email.login', 'Email service is down')
  await signIn.goto()

  // Act
  await signIn.requestOtp(uniqueEmail())

  // Assert
  await signIn.expectError('Email service is down')
})
