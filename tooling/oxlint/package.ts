import { defineConfig } from 'oxlint'

import { acme } from '@acme/oxlint-config/acme.ts'
import { e18e } from '@acme/oxlint-config/e18e.ts'
import { regexp } from '@acme/oxlint-config/regexp.ts'
import sharedConfig, { oxlintOptions } from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, e18e, regexp, acme],
  options: oxlintOptions,
})
