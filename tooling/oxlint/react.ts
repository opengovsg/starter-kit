import { defineConfig } from 'oxlint'
import { selectJsPlugins } from 'ultracite/oxlint/js-plugins'
import ultraciteReact from 'ultracite/oxlint/react'

export const react = defineConfig({
  extends: [ultraciteReact, selectJsPlugins(['react-doctor'])],
  rules: {
    // Index keys hide identity bugs. Ultracite leaves this off; react-doctor
    // only covers random keys, not a list index.
    'react/no-array-index-key': 'error',
  },
})
