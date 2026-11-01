import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** Page object for /sign-in: locators, actions and assertions for this one screen. */
export class SignInPO {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/sign-in')
  }

  private otpInput(email: string) {
    return this.page.getByLabel(`Enter the OTP sent to ${email}`)
  }

  async requestOtp(email: string) {
    await this.page
      .getByLabel('Log in with a .gov.sg or whitelisted email address')
      .fill(email)
    await this.page.getByRole('button', { name: 'Get OTP' }).click()
  }

  async expectOtpPrompt(email: string) {
    await expect(this.otpInput(email)).toBeVisible()
  }

  async submitOtp(email: string, otp: string) {
    await this.otpInput(email).fill(otp)
    await this.page.getByRole('button', { name: 'Log in' }).click()
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible()
  }
}
