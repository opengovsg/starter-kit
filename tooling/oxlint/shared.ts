import { defineConfig } from 'oxlint'
import antiSlop from 'ultracite/oxlint/anti-slop'
import core from 'ultracite/oxlint/core'

/** prisma-extension-kysely does not implement Kysely's transaction API. */
export const kyselyTransactionRestriction = {
  property: 'transaction',
  allowObjects: ['db'],
  message:
    'Use db.$transaction(). The Prisma-Kysely extension does not support $kysely.transaction().',
}

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
      'warn',
      { checksVoidReturn: { attributes: false } },
    ],
    'typescript/no-unnecessary-condition': [
      'error',
      { allowConstantLoopConditions: true },
    ],
    'typescript/no-non-null-assertion': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'vitest/no-conditional-expect': 'off',
    'vitest/require-to-throw-message': 'off',
    'no-restricted-properties': ['error', kyselyTransactionRestriction],
  },
})
