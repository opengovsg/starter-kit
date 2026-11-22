import { defineConfig } from 'oxlint'
import antiSlop from 'ultracite/oxlint/anti-slop'
import core from 'ultracite/oxlint/core'

import { e18e } from '@acme/oxlint-config/e18e.ts'
import landmines from '@acme/oxlint-config/landmines.ts'
import { regexp } from '@acme/oxlint-config/regexp.ts'

/** Oxlint only honors `options` on the root config, not via `extends`. */
export const oxlintOptions = {
  typeAware: true,
  reportUnusedDisableDirectives: 'error',
} as const

/** Same for `env`: `no-eval` / `no-implied-eval` stay half-deaf without it. */
export const oxlintEnv = core.env

export default defineConfig({
  extends: [core, antiSlop, e18e, regexp, landmines],
  options: oxlintOptions,
  env: oxlintEnv,
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
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'max-depth': ['error', { max: 4 }],
    'no-implicit-coercion': 'error',
    'typescript/consistent-type-imports': [
      'error',
      { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
    ],
    'typescript/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: true } },
    ],
    'typescript/prefer-optional-chain': 'error',
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
