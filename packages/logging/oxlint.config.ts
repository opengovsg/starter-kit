import { defineConfig } from 'oxlint'

import { e18e, e18eJsPlugins, e18eSettings } from '@acme/oxlint-config/e18e.ts'
import { vitest } from '@acme/oxlint-config/presets.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, vitest, e18e],
  jsPlugins: [...e18eJsPlugins],
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
  settings: e18eSettings,
})
