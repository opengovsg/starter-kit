import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { RuleTester } from 'oxlint/plugins-dev'

import { e2eFilenameRule } from './e2e-filename.ts'

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

const fake = (rel: string) =>
  path.join('/tmp/e2e-filename-fixture/app/tests/e2e', rel)

const code = 'export {}'

const suffix = (rel: string) => ({
  code,
  errors: [{ messageId: 'suffix' }],
  filename: fake(rel),
})

const e2eRoot = fileURLToPath(
  new URL('../../../../../apps/web/tests/e2e', import.meta.url)
)

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return entry.name === 'test-results' || entry.name === '.auth'
        ? []
        : walk(full)
    }

    return entry.name.endsWith('.ts') ? [full] : []
  })

const scratchE2e = path.join(
  tmpdir(),
  'e2e-filename-rule',
  'app',
  'tests',
  'e2e'
)

const prepareScratch = () => {
  mkdirSync(path.join(scratchE2e, 'billing'), { recursive: true })
  mkdirSync(path.join(scratchE2e, 'admin'), { recursive: true })
  mkdirSync(path.join(scratchE2e, 'helpers'), { recursive: true })
  writeFileSync(
    path.join(scratchE2e, 'helpers', 'invoice.po.ts'),
    'export {}\n'
  )
  writeFileSync(path.join(scratchE2e, 'admin', 'admin.po.ts'), 'export {}\n')
}

prepareScratch()

const validName = (
  rel: string,
  root = '/tmp/e2e-filename-fixture/app/tests/e2e'
) => ({
  code,
  filename: path.join(root, rel),
})

tester.run('e2e-filename', e2eFilenameRule, {
  invalid: [
    suffix('admin/admin.spec.ts'),
    suffix('admin/admin.test.ts'),
    suffix('admin/admin.ts'),
    suffix('helpers/user.ts'),
    suffix('helpers/user.queries.ts'),
    suffix('helpers/foo.e2e.ts'),
    suffix('setup/foo.e2e.ts'),
    suffix('setup/foo.po.ts'),
    suffix('auth/otp/sign-in.e2e.ts'),
    suffix('auth/Sign-in.e2e.ts'),
    suffix('extra.ts'),
    {
      code,
      errors: [{ messageId: 'missingPo' }],
      filename: fake('billing/invoice.e2e.ts'),
    },
  ],
  valid: [
    validName('test.ts'),
    validName('global-setup.ts'),
    validName('auth.setup.ts'),
    validName('helpers/auth.ts'),
    validName('helpers/network.ts'),
    validName('helpers/user.db.ts'),
    validName('helpers/user.expect.ts'),
    validName('helpers/verification-token.factory.ts'),
    validName('helpers/a11y.expect.ts'),
    validName('helpers/shared.po.ts'),
    validName('setup/db.ts'),
    validName('setup/session.ts'),
    validName('public/landing.po.ts'),
    {
      code,
      filename: path.join(scratchE2e, 'billing/invoice.e2e.ts'),
    },
    {
      code,
      filename: path.join(scratchE2e, 'admin/admin.e2e.ts'),
    },
    { code, filename: '/tmp/src/user.service.ts' },
    ...walk(e2eRoot).map((filename) => ({ code, filename })),
  ],
})
