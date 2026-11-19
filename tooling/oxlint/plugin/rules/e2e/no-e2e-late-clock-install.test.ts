import { RuleTester } from 'oxlint/plugins-dev'

import { noE2eLateClockInstallRule } from './no-e2e-late-clock-install.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

const after = { messageId: 'afterNavigation' }
const afterHook = { messageId: 'afterHookNavigation' }

tester.run('no-e2e-late-clock-install', noE2eLateClockInstallRule, {
  invalid: [
    {
      code: "test('x', async ({ page }) => { await page.goto('/'); await page.clock.install() })",
      errors: [after],
    },
    ...['reload()', 'goBack()', 'goForward()', "setContent('<p/>')"].map(
      (call) => ({
        code: `test('x', async ({ page }) => { await page.${call}; await page.clock.install() })`,
        errors: [after],
      })
    ),
    {
      code: "test('x', async ({ page, context }) => { await page.goto('/'); await context.clock.install() })",
      errors: [after],
    },
    {
      code: "test('x', async ({ page }) => { await page.goto('/'); await page.clock.install({ time: new Date() }) })",
      errors: [after],
    },
    {
      code: "test('x', async ({ page }) => { await Promise.all([page.goto('/'), page.clock.install()]) })",
      errors: [after],
    },

    {
      code: "test('x', async ({ page }) => { const po = new SignInPO(page); await po.goto(); await page.clock.install() })",
      errors: [after],
    },
    {
      code: "setup('x', async ({ page }) => { await page.goto('/'); await page.clock.install() })",
      errors: [after],
    },

    {
      code: "test('x', async ({ page }) => { await test.step('open', async () => { await page.goto('/') }); await page.clock.install() })",
      errors: [after],
    },
    {
      code: "test('x', async ({ page }) => { await page.goto('/'); await test.step('time', async () => { await page.clock.install() }) })",
      errors: [after],
    },

    {
      code: "test.describe('d', () => { test('x', async ({ page }) => { await page.goto('/'); await page.clock.install() }) })",
      errors: [after],
    },

    {
      code: "class PO { async open() { await this.page.goto('/'); await this.page.clock.install() } }",
      errors: [after],
    },
    {
      code: "const open = async (page) => { await page.goto('/'); await page.clock.install() }",
      errors: [after],
    },

    {
      code: "test.beforeEach(async ({ page }) => { await page.goto('/') }); test('x', async ({ page }) => { await page.clock.install() })",
      errors: [afterHook],
    },
    {
      code: "test('x', async ({ page }) => { await page.clock.install() }); test.beforeEach(async ({ page }) => { await page.goto('/') })",
      errors: [afterHook],
    },
    {
      code: "test.beforeAll(async ({ browser }) => { const p = await browser.newPage(); await p.goto('/') }); test('x', async ({ page }) => { await page.clock.install() })",
      errors: [afterHook],
    },
    {
      code: "test.beforeEach(async ({ page }) => { await page.goto('/') }); test.describe('d', () => { test('x', async ({ page }) => { await page.clock.install() }) })",
      errors: [afterHook],
    },
    {
      code: "test.describe('d', () => { test.beforeEach(async ({ page }) => { await page.goto('/') }); test.describe('e', () => { test.beforeEach(async ({ page }) => { await page.clock.install() }) }) })",
      errors: [afterHook],
    },
    {
      code: "test.beforeEach(async ({ page }) => { await page.goto('/') }); test.beforeEach(async ({ page }) => { await page.clock.install() })",
      errors: [afterHook],
    },
    {
      code: "test.beforeEach(async ({ page }) => { await page.clock.install() }); test.beforeAll(async ({ browser }) => { const p = await browser.newPage(); await p.goto('/') })",
      errors: [afterHook],
    },
    {
      code: "test.beforeEach(async ({ page }) => { await new SignInPO(page).goto() }); test('x', async ({ page }) => { await page.clock.install() })",
      errors: [afterHook],
    },
  ],
  valid: [
    "test('x', async ({ page }) => { await page.clock.install(); await page.goto('/') })",
    "test('x', async ({ page, context }) => { await context.clock.install(); await page.goto('/') })",
    "test('x', async ({ page }) => { await page.clock.install({ time: new Date() }); await new SignInPO(page).goto() })",

    "test('x', async ({ page }) => { await page.clock.install(); await page.goto('/'); await page.clock.fastForward(1000); await page.clock.setFixedTime(new Date()) })",
    "test('x', async ({ page }) => { await page.goto('/'); await page.clock.setSystemTime(new Date()) })",

    "test('x', async ({ page }) => { await page.clock.install() })",
    "test('x', async ({ page }) => { await page.goto('/') })",

    "test.beforeEach(async ({ page }) => { await page.clock.install() }); test('x', async ({ page }) => { await page.goto('/') })",
    "test.beforeEach(async ({ page }) => { await page.clock.install(); await page.goto('/') }); test('x', async () => {})",

    "test.afterEach(async ({ page }) => { await page.goto('/') }); test('x', async ({ page }) => { await page.clock.install() })",
    "test.beforeEach(async ({ page }) => { await page.clock.install() }); test.beforeEach(async ({ page }) => { await page.goto('/') })",
    "test.beforeAll(async ({ browser }) => { await setup() }); test.beforeEach(async ({ page }) => { await page.goto('/') }); test.beforeAll(async ({ page }) => { await page.clock.install() })",
    "test.describe('a', () => { test.beforeEach(async ({ page }) => { await page.goto('/') }) }); test.describe('b', () => { test('x', async ({ page }) => { await page.clock.install() }) })",
    "test.describe('d', () => { test.beforeAll(async ({ page }) => { await page.clock.install() }) }); test.beforeEach(async ({ page }) => { await page.goto('/') })",

    "test('a', async ({ page }) => { await page.goto('/') }); test('b', async ({ page }) => { await page.clock.install() })",
    "test('x', async ({ page }) => { const go = () => page.goto('/'); await page.clock.install(); await go() })",
    "const go = async (page) => { await page.goto('/') }; test('x', async ({ page }) => { await page.clock.install(); await go(page) })",

    "test('x', async ({ page }) => { await page.goto('/'); await plugin.install() })",
  ].map((code) => ({ code })),
})
