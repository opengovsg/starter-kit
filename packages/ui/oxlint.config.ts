import { defineConfig } from 'oxlint'

import { react } from '@acme/oxlint-config/presets.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, react],
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
})
