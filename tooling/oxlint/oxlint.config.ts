import { defineConfig } from 'oxlint'

import landmines from './landmines.ts'
import packageConfig from './package.ts'
import { oxlintOptions } from './shared.ts'

export default defineConfig({
  extends: [packageConfig, landmines],
  options: oxlintOptions,
})
