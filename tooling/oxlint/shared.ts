import { defineConfig } from 'oxlint'
import antiSlop from 'ultracite/oxlint/anti-slop'
import core from 'ultracite/oxlint/core'

/** Oxlint only honors `options` on the root config, not via `extends`. */
export const oxlintOptions = {
  typeAware: true,
  reportUnusedDisableDirectives: 'error',
} as const

export default defineConfig({
  extends: [core, antiSlop],
  options: oxlintOptions,
  settings: {
    next: {
      rootDir: 'apps/web',
    },
  },
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    '**/*.config.*',
    'dist/**',
    'src/generated/**',
    '.next/**',
    'apps/web/public/mockServiceWorker.js',
  ],
  rules: {
    // ── e18e ───────────────────────────────────────────────────────────
    // e18e rules with no equivalent already set to error in ultracite
    // core or anti-slop. Duplicates of those presets stay off, as does
    // prefer-string-fromcharcode (it contradicts unicorn/prefer-code-point)
    // and no-indexof-equality (it throws without typescript-eslint types).
    'e18e/ban-dependencies': 'error',
    'e18e/no-delete-property': 'error',
    'e18e/prefer-array-fill': 'error',
    'e18e/prefer-array-from-map': 'error',
    'e18e/prefer-array-to-spliced': 'error',
    'e18e/prefer-charcode-at-in-loop': 'error',
    'e18e/prefer-get-or-insert': 'error',
    'e18e/prefer-includes-over-regex-test': 'error',
    'e18e/prefer-inline-equality': 'error',
    'e18e/prefer-slice-over-split-index': 'error',
    'e18e/prefer-static-collator': 'error',
    'e18e/prefer-static-regex': 'error',
    'e18e/prefer-throw-if-no-entry': 'error',
    'e18e/prefer-timer-args': 'error',
    'e18e/prefer-url-canparse': 'error',

    // ── import ─────────────────────────────────────────────────────────
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

    // ── eslint ──────────────────────────────────────────────────────────
    // Ultracite core leaves this off. 4 is ESLint's default.
    'max-depth': ['error', { max: 4 }],

    // ── typescript ─────────────────────────────────────────────────────
    'typescript/consistent-type-imports': [
      'error',
      { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
    ],
    'typescript/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: true } },
    ],
    'typescript/no-non-null-assertion': 'error',
    'typescript/no-unnecessary-condition': [
      'error',
      { allowConstantLoopConditions: true },
    ],
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
})
