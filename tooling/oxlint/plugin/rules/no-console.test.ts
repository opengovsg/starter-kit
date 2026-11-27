import { RuleTester } from 'oxlint/plugins-dev'

import { noConsoleRule } from './no-console.ts'

const tester = new RuleTester({
  languageOptions: {
    globals: { console: 'readonly' },
    parserOptions: { lang: 'ts' },
  },
})

const errors = [{ messageId: 'noConsole' }]

tester.run('no-console', noConsoleRule, {
  invalid: [
    'console.log("hi")',
    'console.error(error)',
    'console.warn(message)',
    'console?.info("hi")',
  ].map((code) => ({ code, errors })),
  valid: [
    'logger.info({ message: "hi" })',
    'const console = { log() {} }; console.log()',
  ].map((code) => ({ code })),
})
