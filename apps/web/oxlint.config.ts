import { defineConfig } from 'oxlint'

import nextReactDoctor from '@acme/oxlint-config/next-react-doctor.ts'
import { jsxA11y, next, react, vitest } from '@acme/oxlint-config/presets.ts'
import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [
    sharedConfig,
    react,
    jsxA11y,
    next,
    vitest,
    reactDoctor,
    nextReactDoctor,
  ],
  jsPlugins: reactDoctor.jsPlugins,
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'off',
  },
  settings: reactDoctorSettings,
  ignorePatterns: ['*.config.*', 'public/mockServiceWorker.js'],
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
      files: ['src/proxy.ts', 'src/instrumentation.ts'],
      rules: {
        'no-restricted-properties': 'off',
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['tests/e2e/**'],
      rules: {
        'no-empty-pattern': 'off',
        'react-hooks/rules-of-hooks': 'off',
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
