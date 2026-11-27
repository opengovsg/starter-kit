import { defineRule } from '@oxlint/plugins'

const E2E_SEGMENT = '/tests/e2e/'

const ROOT_FILES = new Set(['auth.setup.ts', 'global-setup.ts', 'test.ts'])

const HELPER_SUFFIX = /\.(?:db|expect|factory|po)\.ts$/u

const SCREEN_SUFFIX = /\.(?:e2e|po)\.ts$/u

const relativeToE2e = (filename: string) => {
  const norm = filename.replaceAll('\\', '/')
  const at = norm.lastIndexOf(E2E_SEGMENT)

  return at === -1 ? null : norm.slice(at + E2E_SEGMENT.length)
}

const allowed = (rel: string) => {
  const parts = rel.split('/')

  if (parts.length === 1) {
    return ROOT_FILES.has(parts[0] ?? '')
  }

  if (parts.length !== 2) {
    return false
  }

  const [dir, name] = parts

  if (dir === 'helpers') {
    return (
      name === 'auth.ts' ||
      name === 'network.ts' ||
      HELPER_SUFFIX.test(name ?? '')
    )
  }

  if (dir === 'setup') {
    return (
      name?.endsWith('.ts') === true &&
      !name.endsWith('.e2e.ts') &&
      !name.endsWith('.po.ts')
    )
  }

  return SCREEN_SUFFIX.test(name ?? '')
}

export const e2eFilenameRule = defineRule({
  createOnce(context) {
    return {
      Program(node) {
        const rel = relativeToE2e(context.filename)

        if (rel === null || rel.length === 0 || allowed(rel)) {
          return
        }

        context.report({ data: { name: rel }, messageId: 'suffix', node })
      },
    }
  },
  meta: {
    docs: {
      description:
        'Allow only the e2e README filenames under tests/e2e, so a misnamed test is still collected by Playwright.',
    },
    messages: {
      suffix:
        '`{{name}}` is not an e2e file Playwright collects or a README helper. Tests are `<feature>/<screen>.e2e.ts` (`testMatch`), page objects `<screen>.po.ts`, queries `helpers/<entity>.db.ts`, writes `helpers/<entity>.factory.ts`, assertions `helpers/<entity>.expect.ts`.',
    },
    type: 'problem',
  },
})
