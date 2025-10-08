import baseConfig from '@askgov/eslint-config/base'

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['dist/**', 'generated'],
  },
  ...baseConfig,
]
