import { defineConfig } from 'oxlint'

import sharedConfig from './shared.ts'

export default defineConfig({
  extends: [sharedConfig],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'off',
  },
})
