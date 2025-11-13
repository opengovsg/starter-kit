import baseConfig, { restrictEnvAccess } from '@acme/eslint-config/base'
import nextjsConfig from '@acme/eslint-config/nextjs'
import reactConfig from '@acme/eslint-config/react'
import storybookConfig from '@acme/eslint-config/storybook'

export default [
  {
    ignores: ['.next/**', 'public/mockServiceWorker.js'],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...storybookConfig,
  ...restrictEnvAccess,
  {
    files: ['**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
]
