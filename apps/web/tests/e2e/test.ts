import { test as base } from '@playwright/test'

import { AdminPO } from './admin/admin.po'
import { LandingPO } from './public/landing.po'
import { NotFoundPO } from './public/not-found.po'

interface PageObjects {
  admin: AdminPO
  landing: LandingPO
  notFound: NotFoundPO
}

/**
 * The `test` every e2e file imports: Playwright's, plus one fixture per page
 * object. Register a new page object here. `SignInPO` is deliberately absent;
 * only `auth/sign-in.e2e.ts` drives the login UI, so it extends this locally.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */
export const test = base.extend<PageObjects>({
  admin: async ({ page }, use) => {
    await use(new AdminPO(page))
  },
  landing: async ({ page }, use) => {
    await use(new LandingPO(page))
  },
  notFound: async ({ page }, use) => {
    await use(new NotFoundPO(page))
  },
})
