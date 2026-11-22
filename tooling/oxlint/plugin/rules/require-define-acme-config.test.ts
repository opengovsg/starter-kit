import { RuleTester } from 'oxlint/plugins-dev'

import { requireDefineAcmeConfigRule } from './require-define-acme-config.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('require-define-acme-config', requireDefineAcmeConfigRule, {
  invalid: [
    'export default defineConfig({ extends: [shared] })',
    'export default { extends: [shared] }',
    'const config = defineConfig({}); export default config',
    'const config = {}; export default config',
    'export default config',
    'export default oxlint.defineAcmeConfig({})',
    'function inner() { const config = defineAcmeConfig({}) }\nexport default config',
    'function inner() { const config = defineAcmeConfig({}) }\nconst config = defineConfig({})\nexport default config',
  ].map((code) => ({ code, errors: 1 })),
  valid: [
    'export default defineAcmeConfig({ extends: [shared] })',
    'const config = defineAcmeConfig({}); export default config',
    "export { default } from '@acme/oxlint-config'",
    'export const shared = defineConfig({})',
  ].map((code) => ({ code })),
})
