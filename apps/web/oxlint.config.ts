import { defineConfig } from 'oxlint'

import { acme } from '@acme/oxlint-config/acme.ts'
import { e18e } from '@acme/oxlint-config/e18e.ts'
import nextReactDoctor from '@acme/oxlint-config/next-react-doctor.ts'
import {
  playwrightE2eRules,
  playwrightJsPlugins,
} from '@acme/oxlint-config/playwright.ts'
import { next, react, vitest } from '@acme/oxlint-config/presets.ts'
import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import reactQuery from '@acme/oxlint-config/react-query.ts'
import sharedConfig, { oxlintOptions } from '@acme/oxlint-config/shared.ts'
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

const restrictPublicProcedure = {
  group: ['**/trpc'],
  importNames: ['publicProcedure'],
  allowTypeImports: true,
  message:
    'Use protectedProcedure. Public procedures are limited to auth and healthcheck.',
}

type RestrictedPath = { name: string; importNames?: string[]; message: string }
type RestrictedPattern = {
  group: string[]
  importNames?: string[]
  allowTypeImports?: boolean
  message: string
}

// A later override replaces the whole rule, so each one restates the base set.
const restrictImports = (
  patterns: RestrictedPattern[] = [],
  paths: RestrictedPath[] = []
): ['error', { paths: RestrictedPath[]; patterns: RestrictedPattern[] }] => [
  'error',
  {
    paths: [restrictProcessEnvImport, ...paths],
    patterns: [restrictPublicProcedure, ...patterns],
  },
]

// tests/e2e/README.md "Imports", "DB access" and auth rules.
const e2eRelativeImport = {
  group: ['../**'],
  message: 'Use the `~tests/e2e/...` alias; only same-folder `./` is relative.',
}
const e2eNoDb = {
  group: ['@acme/db', '@acme/db/*'],
  message:
    'Test files must not import @acme/db. Add a getter to helpers/<entity>.db.ts.',
}
const e2eNoSignInPO = {
  group: ['**/sign-in.po', './sign-in.po'],
  message: 'Only auth/sign-in.e2e.ts covers the login UI.',
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
    acme,
  ],
  jsPlugins: [...reactDoctor.jsPlugins],
  options: oxlintOptions,
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
        'no-restricted-imports': restrictImports(),
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
      jsPlugins: [...playwrightJsPlugins],
      rules: {
        'no-empty-pattern': 'off',
        'react-hooks/rules-of-hooks': 'off',
        ...playwrightE2eRules,
        // roleTag() returns `@role:${role}`; the plugin only accepts literals.
        'playwright/valid-test-tags': 'off',
        'acme/no-e2e-storage-state': 'error',
        'acme/no-e2e-late-clock-install': 'error',
        'acme/no-e2e-literal-role-tag': 'error',
        'playwright/expect-expect': [
          'error',
          { assertFunctionPatterns: ['^expect'] },
        ],
        'no-restricted-imports': restrictImports([e2eRelativeImport]),
      },
    },
    {
      files: ['tests/e2e/**/*.e2e.ts', 'tests/e2e/**/*.po.ts'],
      rules: {
        'no-restricted-imports': restrictImports([
          e2eRelativeImport,
          e2eNoDb,
          e2eNoSignInPO,
        ]),
      },
    },
    {
      files: ['tests/e2e/auth/sign-in.e2e.ts'],
      rules: {
        'no-restricted-imports': restrictImports([e2eRelativeImport, e2eNoDb]),
      },
    },
    {
      // Defines roleTag(); the only place a literal `@role:` belongs.
      files: ['tests/e2e/helpers/auth.ts'],
      rules: { 'acme/no-e2e-literal-role-tag': 'off' },
    },
    {
      files: ['tests/e2e/helpers/*.db.ts', 'tests/e2e/helpers/*.factory.ts'],
      rules: {
        'no-restricted-imports': restrictImports(
          [e2eRelativeImport],
          [
            {
              name: '@playwright/test',
              message:
                '.db.ts and .factory.ts have no `expect`; assert in <entity>-expect.ts.',
            },
          ]
        ),
      },
    },
    {
      files: [
        '**/__tests__/**',
        '**/__mocks__/**',
        'tests/db/**',
        'tests/redis/**',
      ],
      rules: {
        'anti-slop/no-module-mocking': 'off',
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-type-assertion': 'off',
        'vitest/prefer-describe-function-title': 'off',
      },
    },
  ],
})
