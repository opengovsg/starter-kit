import { defineConfig } from 'oxlint'

import sharedConfig from '@acme/oxlint-config/shared.ts'
import { vitest } from '@acme/oxlint-config/presets.ts'

export default defineConfig({
  extends: [sharedConfig, vitest],
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
})
