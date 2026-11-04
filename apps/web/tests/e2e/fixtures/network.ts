import type { Page } from '@playwright/test'

/**
 * Make a tRPC procedure (e.g. `auth.email.login`) fail with a 500, so a test
 * can check what the user sees on error. Also the pattern for stubbing
 * external services (uploads, third-party APIs) the CI run can't reach.
 */
export const mockTrpcFailure = async (
  page: Page,
  procedure: string,
  message: string
) => {
  await page.route(`**/api/trpc/${procedure}*`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        error: {
          json: {
            code: -32_603,
            data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 },
            message,
          },
        },
      }),
      contentType: 'application/json',
      status: 500,
    })
  })
}
