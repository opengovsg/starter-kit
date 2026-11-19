import { RuleTester } from 'oxlint/plugins-dev'

import { requireE2ePoExpectScanRule } from './require-e2e-po-expect-scan.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

const IMPORT =
  "import { expectNoA11yViolations } from '~tests/e2e/helpers/a11y-expect'\n"

const WAIT = 'await expect(this.page.getByText("x")).toBeVisible()'
const SCAN = 'await expectNoA11yViolations(this.page)'

const po = (members: string, header = IMPORT) =>
  `${header}export class XPO { constructor(page) { this.page = page } ${members} }`

const scanLast = { messageId: 'scanLast' }

tester.run('require-e2e-po-expect-scan', requireE2ePoExpectScanRule, {
  invalid: [
    // --- Scan missing, first, or alone ---
    { code: po(`async expectLoaded() { ${WAIT} }`), errors: [scanLast] },
    { code: po(`async expectError(m) { ${WAIT} }`), errors: [scanLast] },
    { code: po(`async expectLoaded() { ${SCAN} }`), errors: [scanLast] },
    {
      code: po(`async expectLoaded() { ${SCAN}; ${WAIT} }`),
      errors: [scanLast],
    },
    { code: po('async expectLoaded() {}'), errors: [scanLast] },

    // --- "Wait" must be an await, not any statement ---
    {
      code: po(`async expectLoaded() { const x = 1; ${SCAN} }`),
      errors: [scanLast],
    },
    {
      code: po(`async expectLoaded() { this.page.getByText("x"); ${SCAN} }`),
      errors: [scanLast],
    },

    // --- Wrong scan shape ---
    {
      code: po(
        `async expectLoaded() { ${WAIT}; expectNoA11yViolations(this.page) }`
      ),
      errors: [scanLast],
    },
    {
      code: po(
        `async expectLoaded() { ${WAIT}; await expectNoA11yViolations(page) }`
      ),
      errors: [scanLast],
    },
    {
      code: po(
        `async expectLoaded() { ${WAIT}; await expectNoA11yViolations(this.other) }`
      ),
      errors: [scanLast],
    },
    {
      code: po(
        `async expectLoaded() { ${WAIT}; await expectNoA11yViolations(this.page).catch(() => {}) }`
      ),
      errors: [scanLast],
    },
    {
      code: po(`async expectLoaded() { ${WAIT}; if (x) { ${SCAN} } }`),
      errors: [scanLast],
    },

    // --- Fake scanner: not imported, or from elsewhere ---
    {
      code: po(`async expectLoaded() { ${WAIT}; ${SCAN} }`, ''),
      errors: [scanLast],
    },
    {
      code: po(
        `async expectLoaded() { ${WAIT}; ${SCAN} }`,
        "import { expectNoA11yViolations } from './fake'\n"
      ),
      errors: [scanLast],
    },
    {
      code: po(
        `async expectLoaded() { ${WAIT}; ${SCAN} }`,
        'const expectNoA11yViolations = async () => {}\n'
      ),
      // The local fake is itself an unscanned `expect*` function.
      errors: [scanLast, scanLast],
    },

    // --- Early return ---
    {
      code: po(`async expectLoaded() { ${WAIT}; if (x) return; ${SCAN} }`),
      errors: [{ messageId: 'return' }],
    },
    {
      code: po(`async expectLoaded() { ${WAIT}; ${SCAN}; return 1 }`),
      errors: [scanLast, { messageId: 'return' }],
    },

    // --- Every member form and name spelling ---
    { code: po(`expectLoaded = async () => { ${WAIT} }`), errors: [scanLast] },
    {
      code: po(`expectLoaded = async () => expect(this.page).toHaveTitle("x")`),
      errors: [scanLast],
    },
    {
      code: po(`static async expectSomething() { ${WAIT} }`),
      errors: [scanLast],
    },
    {
      code: po(`private async expectHidden() { ${WAIT} }`),
      errors: [scanLast],
    },
    { code: po(`async #expectHidden() { ${WAIT} }`), errors: [scanLast] },
    { code: po(`async 'expectLoaded'() { ${WAIT} }`), errors: [scanLast] },
    { code: po(`async ['expectLoaded']() { ${WAIT} }`), errors: [scanLast] },
    {
      code: po(`get expectReady() { return 1 }`),
      errors: [scanLast, { messageId: 'return' }],
    },
    {
      code: `${IMPORT}class XPO { constructor(page) { this.page = page; this.expectLoaded = async () => { ${WAIT} } } }`,
      errors: [scanLast],
    },

    // --- Non-class page objects ---
    {
      code: `${IMPORT}export const xPO = (page) => ({ expectLoaded: async () => { await expect(page.getByText("x")).toBeVisible() } })`,
      errors: [scanLast],
    },
    {
      code: `${IMPORT}export async function expectLoaded(page) { await expect(page.getByText("x")).toBeVisible() }`,
      errors: [scanLast],
    },
    {
      code: `${IMPORT}export const expectLoaded = async (page) => { await expect(page.getByText("x")).toBeVisible() }`,
      errors: [scanLast],
    },

    // --- Assertions hiding under another name ---
    {
      code: po(`async verifyLoaded() { ${WAIT} }`),
      errors: [{ messageId: 'misnamed' }],
    },
    {
      code: po(
        'async assertCount() { await expect.soft(this.list).toHaveCount(2) }'
      ),
      errors: [{ messageId: 'misnamed' }],
    },
    {
      code: po(
        'async checkUrl() { await expect.poll(() => this.page.url()).toBe("/") }'
      ),
      errors: [{ messageId: 'misnamed' }],
    },
    {
      code: po(
        'async waitUntilReady() { await expect(async () => { await expect(this.x).toBeVisible() }).toPass() }'
      ),
      errors: [{ messageId: 'misnamed' }],
    },

    // --- Several in one class ---
    {
      code: po(
        `async expectLoaded() { ${WAIT}; ${SCAN} } async expectError() { ${WAIT} } async expectOther() { ${WAIT} }`
      ),
      errors: [scanLast, scanLast],
    },
  ],
  valid: [
    po(`async expectLoaded() { ${WAIT}; ${SCAN} }`),
    po(
      `async expectLoaded() { ${WAIT}; await expect(this.page).toHaveTitle("x"); ${SCAN} } async expectError(m) { ${WAIT}; ${SCAN} }`
    ),
    po(`expectLoaded = async () => { ${WAIT}; ${SCAN} }`),
    po(`async #expectHidden() { ${WAIT}; ${SCAN} }`),

    // Aliased import.
    po(
      `async expectLoaded() { ${WAIT}; await scan(this.page) }`,
      "import { expectNoA11yViolations as scan } from '~tests/e2e/helpers/a11y-expect'\n"
    ),

    // Delegating to another checked `expect*` method.
    po(
      `async expectLoaded() { ${WAIT}; ${SCAN} } async expectSignedIn(email) { await this.expectLoaded(); await expect(this.page.getByText(email)).toBeVisible(); await this.expectLoaded() }`
    ),

    // A wait inside a retried assertion, then the scan.
    po(
      `async expectLoaded() { await expect(async () => { await expect(this.x).toBeVisible() }).toPass(); ${SCAN} }`
    ),

    // Returns in nested callbacks are fine.
    po(
      `async expectRows() { await expect.poll(async () => { return this.page.locator("tr").count() }).toBe(2); ${SCAN} }`
    ),

    // Non-expect members are untouched.
    po(
      'async goto() { return await this.page.goto("/") } async requestOtp() { await this.page.click("x") } otpInput() { return this.page.getByLabel("x") }'
    ),
    po('readonly expectedTitle = "x"'),
    po('async expectedCount() { return 1 }'),
  ].map((code) => ({ code })),
})
