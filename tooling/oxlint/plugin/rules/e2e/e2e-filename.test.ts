import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { RuleTester } from 'oxlint/plugins-dev'

import { e2eFilenameRule } from './e2e-filename.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

const root = '/tmp/e2e-filename-fixture/app/tests/e2e'
const code = 'export {}'

const named = (rel: string) => ({ code, filename: path.join(root, rel) })

const e2eRoot = fileURLToPath(
  new URL('../../../../../apps/web/tests/e2e', import.meta.url)
)

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)

    if (!entry.isDirectory()) {
      return entry.name.endsWith('.ts') ? [full] : []
    }

    return entry.name === 'test-results' || entry.name === '.auth'
      ? []
      : walk(full)
  })

tester.run('e2e-filename', e2eFilenameRule, {
  invalid: [
    'admin/admin.spec.ts',
    'admin/admin.test.ts',
    'admin/admin.ts',
    'helpers/user.ts',
    'helpers/user.queries.ts',
    'helpers/foo.e2e.ts',
    'setup/foo.e2e.ts',
    'setup/foo.po.ts',
    'auth/otp/sign-in.e2e.ts',
    'extra.ts',
  ].map((rel) => ({
    ...named(rel),
    errors: [{ messageId: 'suffix' }],
  })),
  valid: [
    ...[
      'test.ts',
      'global-setup.ts',
      'auth.setup.ts',
      'helpers/auth.ts',
      'helpers/network.ts',
      'helpers/user.db.ts',
      'helpers/user.expect.ts',
      'helpers/verification-token.factory.ts',
      'helpers/a11y.expect.ts',
      'helpers/shared.po.ts',
      'setup/db.ts',
      'setup/session.ts',
      'public/landing.po.ts',
      'billing/invoice.e2e.ts',
      'auth/Sign-in.e2e.ts',
    ].map(named),
    ...walk(e2eRoot).map((filename) => ({ code, filename })),
  ],
})
