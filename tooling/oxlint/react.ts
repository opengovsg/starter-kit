import { defineConfig } from 'oxlint'
import { selectJsPlugins } from 'ultracite/oxlint/js-plugins'
import ultraciteReact from 'ultracite/oxlint/react'

export const react = defineConfig({
  extends: [ultraciteReact, selectJsPlugins(['react-doctor'])],
  rules: {
    'react/no-array-index-key': 'error',
  },
})
