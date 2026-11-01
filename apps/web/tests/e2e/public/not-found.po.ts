import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** Page object for the 404 page shown for any unknown route. */
export class NotFoundPO {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** Returns the response so the test can assert the 404 status. */
  async goto(path: string) {
    return await this.page.goto(path)
  }

  async expectShown() {
    await expect(this.page.getByText('Page Not Found')).toBeVisible()
  }
}
