import { defineConfig } from 'oxlint'

import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'off',
  },
})
