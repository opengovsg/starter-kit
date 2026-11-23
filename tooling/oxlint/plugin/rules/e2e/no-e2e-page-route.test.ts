import { RuleTester } from 'oxlint/plugins-dev'

import { noE2ePageRouteRule } from './no-e2e-page-route.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('no-e2e-page-route', noE2ePageRouteRule, {
  invalid: [
    "await page.route('**/api', () => {})",
    "await context.route('**', () => {})",
    "await browserContext.route('**', () => {})",
    "class P { async stub() { await this.page.route('**', () => {}) } }",
    "await page['route']('**', () => {})",
    "await page?.route('**', () => {})",
    "await page.route('**', async (route) => { await route.fulfill({}) })",
  ].map((code) => ({ code, errors: [{ messageId: 'route' }] })),
  valid: ["await page.goto('/')", 'route()', 'const stub = page.route'].map(
    (code) => ({ code })
  ),
})
