import { RuleTester } from 'oxlint/plugins-dev'

import { noE2eLiteralRoleTagRule } from './no-e2e-literal-role-tag.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('no-e2e-literal-role-tag', noE2eLiteralRoleTagRule, {
  invalid: [
    "test.describe('x', { tag: '@role:user' }, () => {})",
    "test.describe('x', { tag: '@role:usr' }, () => {})",
    "test('x', { tag: ['@slow', '@role:user'] }, () => {})",
    'test.describe("x", { tag: "@role:user" }, () => {})',
    `test.describe('x', { tag: \`@role:\${role}\` }, () => {})`,
    'const tag = `@role:user`',
    "const tag = '@role:' + role",
  ].map((code) => ({ code, errors: 1 })),
  valid: [
    "test.describe('x', { tag: roleTag('user') }, () => {})",
    "test('x', { tag: ['@slow', roleTag('user')] }, () => {})",
    "test.describe('x', { tag: '@slow' }, () => {})",
    "const role = 'user'",
    'const re = /@role:/u',
    `const s = \`role: \${role}\``,
  ].map((code) => ({ code })),
})
