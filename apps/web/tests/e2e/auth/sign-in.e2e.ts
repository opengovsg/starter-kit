import { randomUUID } from 'node:crypto'

import { expect } from '@playwright/test'
import { mockTrpcFailure } from '~tests/e2e/helpers/network'
import { expectUserLastLogin } from '~tests/e2e/helpers/user.expect'
import { setKnownOtp } from '~tests/e2e/helpers/verification-token.factory'
import { test as base } from '~tests/e2e/test'

import { SignInPO } from './sign-in.po'

const test = base.extend<{ signIn: SignInPO }>({
  signIn: async ({ page }, use) => {
    await use(new SignInPO(page))
  },
})

const uniqueEmail = () => `sign-in-${randomUUID()}@e2e.gov.sg`
const adminUrl = /\/admin$/u

test('signs in with email OTP', async ({ page, signIn }) => {
  const email = uniqueEmail()
  await signIn.goto()

  await signIn.requestOtp(email)
  await signIn.expectOtpPrompt(email)
  await signIn.submitOtp(email, await setKnownOtp(email))

  await expect(page).toHaveURL(adminUrl)
  await expectUserLastLogin(email)
})

test('shows the error when requesting an OTP fails', async ({
  page,
  signIn,
}) => {
  await mockTrpcFailure(page, 'auth.email.login', 'Email service is down')
  await signIn.goto()
  await signIn.requestOtp(uniqueEmail())
  await signIn.expectError('Email service is down')
})
