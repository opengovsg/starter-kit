import { defineConfig } from 'oxlint'

import { next, react, vitest } from '@acme/oxlint-config/presets.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, react, next, vitest],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'off',
  },
  // Playwright e2e tests live under tests/e2e and use @playwright/test, not Vitest.
  // Excluding them avoids vitest/* rules firing on *.test.ts filenames.
  ignorePatterns: ['*.config.*', 'public/mockServiceWorker.js', 'tests/e2e/**'],
  overrides: [
    {
      files: ['**/*.{js,ts,tsx}'],
      rules: {
        // React Compiler handles memoization; manual useMemo/useCallback is unnecessary.
        'react/jsx-no-constructed-context-values': 'off',
        'no-restricted-properties': [
          'error',
          {
            object: 'process',
            property: 'env',
            message:
              "Use `import { env } from '~/env'` instead to ensure validated types.",
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            name: 'process',
            importNames: ['env'],
            message:
              "Use `import { env } from '~/env'` instead to ensure validated types.",
          },
        ],
      },
    },
    {
      files: ['**/env.ts'],
      rules: {
        'no-restricted-properties': 'off',
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['**/__tests__/**', 'tests/**', '**/__mocks__/**'],
      rules: {
        'anti-slop/no-chained-type-assertions': 'off',
        'anti-slop/no-module-mocking': 'off',
        'anti-slop/require-safety-comment-for-type-assertion': 'off',
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-type-assertion': 'off',
        'vitest/prefer-describe-function-title': 'off',
      },
    },
  ],
})
