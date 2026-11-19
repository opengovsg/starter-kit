import { RuleTester } from 'oxlint/plugins-dev'

import { noE2eStorageStateRule } from './no-e2e-storage-state.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('no-e2e-storage-state', noE2eStorageStateRule, {
  invalid: [
    "test.use({ storageState: 'a.json' })",
    'test.use({ storageState })',
    "test.use({ 'storageState': 'a.json' })",
    "test.use({ ['storageState']: 'a.json' })",
    'test.use({ [`storageState`]: s })',
    "test.use({ locale: 'en', storageState: storageStateFor('user') })",

    "test.describe('x', () => { test.use({ storageState: s }) })",
    "test['use']({ storageState: s })",

    'setup.use({ storageState: s })',
    'base.use({ storageState: s })',

    "test.extend({ storageState: async ({}, use) => use('a.json') })",
    'browser.newContext({ storageState: s })',
    'browser.newPage({ storageState: s })',
    "await browser.newContext({ locale: 'en', storageState: s })",
  ].map((code) => ({ code, errors: 1 })),
  valid: [
    "test.use({ locale: 'en' })",
    "test.describe('x', () => {})",
    'test.extend({ page: async ({ page }, use) => use(page) })',
    'browser.newContext()',
    "browser.newContext({ locale: 'en' })",
    'test.use({ [key]: s })',
    'const o = { storageState: 1 }',
    "foo({ storageState: 'a.json' })",
    "test.other({ storageState: 'a.json' })",
    'const { storageState } = opts',
    'test.use(opts)',
    'test.use({ ...opts })',
  ].map((code) => ({ code })),
})
