import { existsSync } from 'node:fs'
import path from 'node:path'

import { defineRule } from '@oxlint/plugins'

const E2E_SEGMENT = '/tests/e2e/'

const ROOT_FILES = new Set(['auth.setup.ts', 'global-setup.ts', 'test.ts'])

const HELPER_EXACT = new Set(['auth.ts', 'network.ts'])

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

const HELPER_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:db|expect|factory|po)\.ts$/u

const SCREEN_FILE = /^(?<stem>[a-z0-9]+(?:-[a-z0-9]+)*)\.(?<kind>e2e|po)\.ts$/u

type Issue =
  | { data: { name: string }; messageId: 'suffix' }
  | { data: { stem: string }; messageId: 'missingPo' }

const normalize = (filename: string) => filename.replaceAll('\\', '/')

const splitE2e = (filename: string) => {
  const norm = normalize(filename)
  const at = norm.lastIndexOf(E2E_SEGMENT)

  if (at === -1) {
    return null
  }

  return {
    rel: norm.slice(at + E2E_SEGMENT.length),
    root: norm.slice(0, at + '/tests/e2e'.length),
  }
}

const isSetupModule = (name: string) =>
  name.endsWith('.ts') && !name.endsWith('.e2e.ts') && !name.endsWith('.po.ts')

const screenStem = (name: string) => {
  const match = SCREEN_FILE.exec(name)

  if (match?.groups?.kind !== 'e2e') {
    return null
  }

  return match.groups.stem ?? null
}

const classifyHelper = (name: string): 'bad' | 'ok' => {
  if (HELPER_EXACT.has(name) || HELPER_FILE.test(name)) {
    return 'ok'
  }

  return 'bad'
}

const classifyScreen = (dir: string, name: string): 'bad' | 'e2e' | 'ok' => {
  const match = KEBAB.test(dir) ? SCREEN_FILE.exec(name) : null

  if (match?.groups?.kind === 'e2e') {
    return 'e2e'
  }

  return match?.groups?.kind === 'po' ? 'ok' : 'bad'
}

/**
 * `rel` is the path under `tests/e2e`. `e2e` means the name is a screen test
 * and still needs a matching page object.
 */
const classify = (rel: string): 'bad' | 'e2e' | 'ok' => {
  const parts = rel.split('/')

  if (parts.length === 1) {
    return ROOT_FILES.has(parts[0] ?? '') ? 'ok' : 'bad'
  }

  if (parts.length !== 2) {
    return 'bad'
  }

  const [dir, name] = parts

  if (dir === undefined || name === undefined || name.length === 0) {
    return 'bad'
  }

  if (dir === 'helpers') {
    return classifyHelper(name)
  }

  if (dir === 'setup') {
    return isSetupModule(name) ? 'ok' : 'bad'
  }

  return classifyScreen(dir, name)
}

const pageObjectExists = (root: string, dir: string, stem: string) =>
  existsSync(path.join(root, dir, `${stem}.po.ts`)) ||
  existsSync(path.join(root, 'helpers', `${stem}.po.ts`))

const issueFor = (filename: string): Issue | null => {
  const split = splitE2e(filename)

  if (split === null || split.rel.length === 0) {
    return null
  }

  const kind = classify(split.rel)

  if (kind === 'bad') {
    return { data: { name: split.rel }, messageId: 'suffix' }
  }

  if (kind !== 'e2e') {
    return null
  }

  const [dir, name] = split.rel.split('/')
  const stem = name === undefined ? null : screenStem(name)

  if (
    dir === undefined ||
    stem === null ||
    pageObjectExists(split.root, dir, stem)
  ) {
    return null
  }

  return { data: { stem }, messageId: 'missingPo' }
}

export const e2eFilenameRule = defineRule({
  createOnce(context) {
    return {
      Program(node) {
        const issue = issueFor(context.filename)

        if (issue !== null) {
          context.report({ data: issue.data, messageId: issue.messageId, node })
        }
      },
    }
  },
  meta: {
    docs: {
      description:
        'Allow only the e2e README filenames, and require each screen test to have its page object.',
    },
    messages: {
      missingPo:
        '`{{stem}}.e2e.ts` needs `{{stem}}.po.ts` in this folder or in `helpers/`. Name the file after the screen; Playwright `testMatch` only runs `*.e2e.ts`.',
      suffix:
        '`{{name}}` is not an e2e file Playwright collects or a README helper. Tests are `<feature>/<screen>.e2e.ts` (`testMatch`), page objects `<screen>.po.ts`, queries `helpers/<entity>.db.ts`, writes `helpers/<entity>.factory.ts`, assertions `helpers/<entity>.expect.ts`.',
    },
    type: 'problem',
  },
})
