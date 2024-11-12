// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            importNames: ['Suspense'],
            message:
              'Please use Suspense from /components instead. Default React 18 Suspense is not supported for SSR',
          },
          {
            name: 'lodash',
            message:
              "Please use `import [package] from 'lodash/[package]'` for better tree-shaking instead.",
          },
        ],
        patterns: ['!lodash/*'],
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.tsx', '**/*.jsx'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '~/env.mjs',
                importNames: ['env'],
                allowTypeImports: true,
                message:
                  'Please use `hooks/useEnv` hook instead. This prevents unusable env variables in client-side code.',
              },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: ['webpack.config.js'],
}
module.exports = config
