import { defineConfig } from 'oxlint'

import { vitest } from '@acme/oxlint-config/presets.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, vitest],
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
})
