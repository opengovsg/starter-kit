import baseConfig, { restrictEnvAccess } from '@acme/eslint-config/base'
import nextjsConfig from '@acme/eslint-config/nextjs'
import reactConfig from '@acme/eslint-config/react'

export default [
  {
    ignores: ['.next/**'],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
  {
    files: ['**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
]
