import { defineConfig } from 'oxlint'

import sharedConfig from '@acme/oxlint-config/shared.ts'
import { react } from '@acme/oxlint-config/presets.ts'

export default defineConfig({
  extends: [sharedConfig, react],
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
})
