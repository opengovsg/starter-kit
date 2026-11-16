import { randomUUID } from 'node:crypto'

import { expect, test } from '@playwright/test'
import { mockTrpcFailure } from '~tests/e2e/fixtures/network'
import { setKnownOtp } from '~tests/e2e/fixtures/otp'
import { expectUserLastLogin } from '~tests/e2e/fixtures/user-expect'

import { SignInPO } from './sign-in.po'

const uniqueEmail = () => `sign-in-${randomUUID()}@e2e.gov.sg`
const adminUrl = /\/admin$/u

test('signs in with email OTP', async ({ page }) => {
  const email = uniqueEmail()
  const signIn = new SignInPO(page)
  await signIn.goto()

  await signIn.requestOtp(email)
  await signIn.expectOtpPrompt(email)
  await signIn.submitOtp(email, await setKnownOtp(email))

  await expect(page).toHaveURL(adminUrl)
  await expectUserLastLogin(email)
})

test('shows the error when requesting an OTP fails', async ({ page }) => {
  const signIn = new SignInPO(page)
  await mockTrpcFailure(page, 'auth.email.login', 'Email service is down')
  await signIn.goto()
  await signIn.requestOtp(uniqueEmail())
  await signIn.expectError('Email service is down')
})
