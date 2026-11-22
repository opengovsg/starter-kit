import { acme } from '@acme/oxlint-config/acme.ts'
import { defineAcmeConfig } from '@acme/oxlint-config/define.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'
import { vitest } from '@acme/oxlint-config/vitest.ts'

export default defineAcmeConfig({
  extends: [sharedConfig, acme, vitest],
})
