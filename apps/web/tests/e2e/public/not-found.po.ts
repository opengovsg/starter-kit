import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class NotFoundPO {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path: string) {
    return await this.page.goto(path)
  }

  async expectShown() {
    await expect(this.page.getByText('Page Not Found')).toBeVisible()
  }
}
