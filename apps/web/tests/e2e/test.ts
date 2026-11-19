import { test as base } from '@playwright/test'
import { expectNoA11yViolations } from '~tests/e2e/helpers/a11y.expect'

import { AdminPO } from './admin/admin.po'
import { LandingPO } from './public/landing.po'
import { NotFoundPO } from './public/not-found.po'

interface PageObjects {
  admin: AdminPO
  landing: LandingPO
  notFound: NotFoundPO
}

interface A11y {
  /** Opt out with `test.use({ a11y: false })` when a test ends on a deliberately broken page. */
  a11y: boolean
  a11yCheck: undefined
}

/**
 * The `test` every e2e file imports: Playwright's, plus one fixture per page
 * object and an automatic accessibility check. Register a new page object
 * here. `SignInPO` is deliberately absent; only `auth/sign-in.e2e.ts` drives
 * the login UI, so it extends this locally.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */
export const test = base.extend<PageObjects & A11y>({
  a11y: [true, { option: true }],
  a11yCheck: [
    async ({ a11y, page }, use, testInfo) => {
      await use(undefined)

      if (
        a11y &&
        testInfo.status === testInfo.expectedStatus &&
        page.url() !== 'about:blank'
      ) {
        await expectNoA11yViolations(page)
      }
    },
    { auto: true },
  ],
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
