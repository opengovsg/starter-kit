import { defineAcmeConfig } from '@acme/oxlint-config/define.ts'
import { reactDoctor } from '@acme/oxlint-config/react-doctor.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'
import { tailwindcssOxlint } from '@acme/oxlint-config/tailwindcss.ts'
import { react } from '@acme/oxlint-config/ultracite.ts'

// `@source` in the web app's globals.css covers this package.
export default defineAcmeConfig({
  extends: [
    sharedConfig,
    react,
    reactDoctor,
    tailwindcssOxlint('../../apps/web/src/app/globals.css'),
  ],
})
