import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LandingPO {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/')
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', {
        name: 'Build production ready applications in minutes.',
      })
    ).toBeVisible()
  }
}
