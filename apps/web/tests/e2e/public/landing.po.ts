import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { env } from '~/env'

/** Page object for /: the public landing page. */
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
      this.page.getByText(env.NEXT_PUBLIC_APP_NAME).first()
    ).toBeVisible()
  }
}
