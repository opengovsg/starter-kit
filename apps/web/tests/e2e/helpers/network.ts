import type { Page } from '@playwright/test'

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
