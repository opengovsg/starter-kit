import { defineConfig } from 'oxlint'

import { e18e } from '@acme/oxlint-config/e18e.ts'
import { vitest } from '@acme/oxlint-config/presets.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, vitest, e18e],
  options: {
    reportUnusedDisableDirectives: 'warn',
    typeAware: true,
  },
})
