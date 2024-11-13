// import reactPlugin from 'eslint-plugin-react'
// import hooksPlugin from 'eslint-plugin-react-hooks'
// import storybook from 'eslint-plugin-storybook'
// import globals from 'globals'
// import tseslint from 'typescript-eslint'

// export default tseslint.config(
//   {
//     files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
//     ...reactPlugin.configs.flat.recommended,
//     languageOptions: {
//       ...reactPlugin.configs.flat.recommended.languageOptions,
//       globals: {
//         ...globals.serviceworker,
//         ...globals.browser,
//       },
//     },
//   },
//   {
//     files: ['**/**/*.{js,ts,jsx,tsx}'],
//     plugins: {
//       'react-hooks': hooksPlugin,
//     },
//     rules: {
//       'react/react-in-jsx-scope': 'off',
//       'react/prop-types': 'off',
//       ...hooksPlugin.configs.recommended.rules,
//     },
//   },
//   ...storybook.configs['flat/recommended'],
// )

import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  files: ['**/*.ts', '**/*.tsx'],
  plugins: {
    react: reactPlugin,
    'react-hooks': hooksPlugin,
  },
  rules: {
    ...reactPlugin.configs['jsx-runtime'].rules,
    ...hooksPlugin.configs.recommended.rules,
  },
  languageOptions: {
    globals: {
      React: 'writable',
    },
  },
})
