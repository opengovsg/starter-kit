import { defineConfig } from 'oxlint'

import sharedConfig from '../../tooling/oxlint/shared.ts'

export default defineConfig({
  extends: [sharedConfig],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'off',
  },
  ignorePatterns: ['*.config.*'],
  overrides: [
    {
      files: ['**/*.{js,ts,tsx}'],
      rules: {
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
      files: ['**/__tests__/**'],
      rules: {
        'typescript/no-unsafe-assignment': 'off',
      },
    },
  ],
})
