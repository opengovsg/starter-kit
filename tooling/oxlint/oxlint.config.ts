import { defineConfig } from 'oxlint'

import landmines from './landmines.ts'
import packageConfig from './package.ts'
import { oxlintOptions } from './shared.ts'

/** Root config for this package. `options` only apply here, not via `extends`. */
export default defineConfig({
  extends: [packageConfig, landmines],
  options: oxlintOptions,
})
