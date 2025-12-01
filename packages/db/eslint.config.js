import baseConfig from '@acme/eslint-config/base'

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['src/generated/**', 'dist/**'],
  },
  {
    // NOTE: we should ban accesses on the `transaction` property for kysely
    // because this doesn't work well with the plugin
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[property.name='transaction'][object.property.name='$kysely']",
          message: 'Use db.$transaction() instead of db.$kysely.transaction()',
        },
      ],
    },
  },
  ...baseConfig,
]
