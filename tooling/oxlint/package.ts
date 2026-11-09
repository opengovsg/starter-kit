import { defineConfig } from 'oxlint'

import { e18e, e18eJsPlugins } from '@acme/oxlint-config/e18e.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, e18e],
  jsPlugins: [...e18eJsPlugins],
  options: {
    typeAware: true,
    reportUnusedDisableDirectives: 'off',
  },
})
