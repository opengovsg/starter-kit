import { defineConfig } from 'oxlint'

import sharedConfig, {
  oxlintEnv,
  oxlintOptions,
} from '@acme/oxlint-config/shared.ts'
import { vitest } from '@acme/oxlint-config/vitest.ts'

export default defineConfig({
  extends: [sharedConfig, vitest],
  env: oxlintEnv,
  options: oxlintOptions,
})
