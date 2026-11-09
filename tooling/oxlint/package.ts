import { defineConfig } from 'oxlint'

import { acme } from './acme.ts'
import { e18e } from './e18e.ts'
import sharedConfig from './shared.ts'

export default defineConfig({
  extends: [sharedConfig, e18e, acme],
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
})
