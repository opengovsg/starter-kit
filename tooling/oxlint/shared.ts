import { defineConfig } from 'oxlint'
import antiSlop from 'ultracite/oxlint/anti-slop'
import core from 'ultracite/oxlint/core'

import { acmeJsPlugins } from '@acme/oxlint-config/acme.ts'
import { e18e } from '@acme/oxlint-config/e18e.ts'
import landmines from '@acme/oxlint-config/landmines.ts'
import { regexp } from '@acme/oxlint-config/regexp.ts'

export default defineConfig({
  extends: [core, antiSlop, e18e, regexp, landmines],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'error',
  },
  ignorePatterns: [
    ...core.ignorePatterns,
    'dist/**',
    'src/generated/**',
    '.next/**',
    'public/mockServiceWorker.js',
  ],
  overrides: [
    {
      files: ['**/oxlint.config.*'],
      jsPlugins: acmeJsPlugins,
      rules: { 'acme/require-define-acme-config': 'error' },
    },
  ],
  rules: {
    'import/export': 'error',
    'import/named': 'error',
    'import/no-anonymous-default-export': 'error',
    'import/no-dynamic-require': 'error',
    'import/unambiguous': 'error',
    'max-depth': ['error', { max: 4 }],
    'max-params': ['error', { max: 4 }],
    'no-continue': 'error',
    'no-implicit-coercion': 'error',
    'no-negated-condition': 'error',
    'unicorn/explicit-length-check': 'error',
    'unicorn/no-nested-ternary': 'error',
    'unicorn/prefer-global-this': 'error',
    'unicorn/prefer-top-level-await': 'error',
    'typescript/consistent-type-imports': [
      'error',
      { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
    ],
    'typescript/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: true } },
    ],
    'typescript/no-require-imports': 'error',
    'typescript/prefer-optional-chain': 'error',
    'typescript/no-unnecessary-condition': [
      'error',
      { allowConstantLoopConditions: true },
    ],
    'typescript/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
})
