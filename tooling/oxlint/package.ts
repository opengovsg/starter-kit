import { defineConfig } from 'oxlint'

import { acme } from '@acme/oxlint-config/acme.ts'
import sharedConfig, {
  oxlintEnv,
  oxlintOptions,
} from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, acme],
  env: oxlintEnv,
  options: oxlintOptions,
})
