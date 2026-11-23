import { RuleTester } from 'oxlint/plugins-dev'

import { noE2ePageRouteRule } from './no-e2e-page-route.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

const testFile = '/tmp/app/tests/e2e/auth/sign-in.e2e.ts'
const networkFile = '/tmp/app/tests/e2e/helpers/network.ts'

const routed = (code: string, filename = testFile) => ({
  code,
  errors: [{ messageId: 'route' }],
  filename,
})

tester.run('no-e2e-page-route', noE2ePageRouteRule, {
  invalid: [
    routed("await page.route('**/api', () => {})"),
    routed("await context.route('**', () => {})"),
    routed("await browserContext.route('**', () => {})"),
    routed(
      "class P { async stub() { await this.page.route('**', () => {}) } }"
    ),
    routed("await page['route']('**', () => {})"),
    routed("await page?.route('**', () => {})"),
  ],
  valid: [
    {
      code: "await page.route('**', async (route) => { await route.fulfill({}) })",
      filename: networkFile,
    },
    { code: "await page.goto('/')", filename: testFile },
    { code: 'route()', filename: testFile },
    { code: 'const stub = page.route', filename: testFile },
    {
      code: "await page.route('**', () => {})",
      filename: '/tmp/src/app/page.ts',
    },
  ],
})
