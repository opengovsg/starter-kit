import baseConfig, { restrictEnvAccess } from '@starter-kit/eslint-config/base'
import nextjsConfig from '@starter-kit/eslint-config/nextjs'
import reactConfig from '@starter-kit/eslint-config/react'

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['.next/**', '!.storybook/**'],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: true },
      ],
    },
  },
]
