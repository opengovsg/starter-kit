import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  // @ts-ignore config exists
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs['jsx-runtime'].rules,
    },
    languageOptions: {
      globals: {
        React: 'writable',
      },
    },
  },
])
