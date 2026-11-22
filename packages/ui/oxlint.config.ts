import { defineConfig } from 'oxlint'

import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import sharedConfig, {
  oxlintEnv,
  oxlintOptions,
} from '@acme/oxlint-config/shared.ts'
import {
  tailwindcssOxlint,
  tailwindcssUiSettings,
} from '@acme/oxlint-config/tailwindcss.ts'
import { react } from '@acme/oxlint-config/ultracite.ts'

export default defineConfig({
  extends: [sharedConfig, react, reactDoctor, tailwindcssOxlint],
  jsPlugins: [...reactDoctor.jsPlugins],
  env: oxlintEnv,
  options: oxlintOptions,
  settings: {
    ...reactDoctorSettings,
    ...tailwindcssUiSettings,
  },
})
