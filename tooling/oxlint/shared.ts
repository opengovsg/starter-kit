import { defineConfig } from 'oxlint'
import antiSlop from 'ultracite/oxlint/anti-slop'
import core from 'ultracite/oxlint/core'

export default defineConfig({
  extends: [core, antiSlop],
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
    'typescript/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'typescript/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
    'typescript/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: false } },
    ],
    // Ultracite core turns size caps off; warn-only inventory.
    'max-lines-per-function': [
      'warn',
      { max: 80, skipBlankLines: true, skipComments: true },
    ],
    'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
    'max-depth': ['error', { max: 4 }],
    'max-params': ['warn', { max: 4 }],
    // Ultracite: error at default 20. Measure warn@15.
    complexity: ['warn', { max: 15 }],
    'typescript/no-unnecessary-condition': [
      'error',
      { allowConstantLoopConditions: true },
    ],
    'typescript/no-non-null-assertion': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'vitest/no-conditional-expect': 'off',
    'vitest/require-to-throw-message': 'off',
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
  },
})
