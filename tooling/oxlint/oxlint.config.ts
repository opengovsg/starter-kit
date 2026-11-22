import { defineConfig } from 'oxlint'

import packageConfig from '@acme/oxlint-config'

import { oxlintEnv, oxlintOptions } from '@acme/oxlint-config/shared.ts'
import { vitest } from '@acme/oxlint-config/vitest.ts'

export default defineConfig({
  extends: [packageConfig, vitest],
  env: oxlintEnv,
  options: oxlintOptions,
})
