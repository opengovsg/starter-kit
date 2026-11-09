import { defineConfig } from 'oxlint'

import { e18e, e18eJsPlugins } from '@acme/oxlint-config/e18e.ts'
import nextReactDoctor from '@acme/oxlint-config/next-react-doctor.ts'
import { next, react, vitest } from '@acme/oxlint-config/presets.ts'
import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import reactQuery from '@acme/oxlint-config/react-query.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'
import {
  tailwindcssOxlint,
  tailwindcssWebSettings,
} from '@acme/oxlint-config/tailwindcss.ts'

const restrictProcessEnvImport = {
  name: 'process',
  importNames: ['env'],
  message:
    "Use `import { env } from '~/env'` instead to ensure validated types.",
}

export default defineConfig({
  extends: [
    sharedConfig,
    react,
    next,
    vitest,
    reactDoctor,
    nextReactDoctor,
    reactQuery,
    tailwindcssOxlint,
    e18e,
  ],
  jsPlugins: [...reactDoctor.jsPlugins, ...e18eJsPlugins],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'off',
  },
  settings: {
    ...reactDoctorSettings,
    ...tailwindcssWebSettings,
  },
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
          {
            property: 'transaction',
            allowObjects: ['db'],
            message:
              'Use db.$transaction(). The Prisma-Kysely extension does not support $kysely.transaction().',
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [restrictProcessEnvImport],
            patterns: [
              {
                group: ['**/trpc'],
                importNames: ['publicProcedure'],
                allowTypeImports: true,
                message:
                  'Use protectedProcedure. Public procedures are limited to auth and healthcheck.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/server/api/root.ts', 'src/server/api/routers/auth/**'],
      rules: {
        'no-restricted-imports': ['error', restrictProcessEnvImport],
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
