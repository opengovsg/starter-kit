import { defineAcmeConfig } from '@acme/oxlint-config/define.ts'
import { react } from '@acme/oxlint-config/react.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'
import { tailwindcssOxlint } from '@acme/oxlint-config/tailwindcss.ts'

export default defineAcmeConfig({
  extends: [
    sharedConfig,
    react,
    tailwindcssOxlint('../../apps/web/src/app/globals.css'),
  ],
})
