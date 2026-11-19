import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { expectNoA11yViolations } from '~tests/e2e/helpers/a11y-expect'

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
    await expectNoA11yViolations(this.page)
  }
}
