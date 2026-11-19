import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { expectNoA11yViolations } from '~tests/e2e/helpers/a11y-expect'

export class AdminPO {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/admin')
  }

  async openAccountMenu() {
    await this.page.getByRole('navigation').getByRole('button').click()
  }

  async expectLoaded() {
    await expect(
      this.page.getByText('This is the root admin page')
    ).toBeVisible()
    await expectNoA11yViolations(this.page)
  }

  async expectSignedInAs(email: string) {
    await expect(this.page.getByText(email)).toBeVisible()
    await expectNoA11yViolations(this.page)
  }
}
