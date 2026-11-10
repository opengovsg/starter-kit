import { defineConfig } from 'oxlint'

import { e18e } from '@acme/oxlint-config/e18e.ts'
import { react } from '@acme/oxlint-config/presets.ts'
import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import sharedConfig, { oxlintOptions } from '@acme/oxlint-config/shared.ts'
import {
  tailwindcssOxlint,
  tailwindcssUiSettings,
} from '@acme/oxlint-config/tailwindcss.ts'

export default defineConfig({
  extends: [sharedConfig, react, reactDoctor, tailwindcssOxlint, e18e],
  jsPlugins: [...reactDoctor.jsPlugins],
  options: oxlintOptions,
  settings: {
    ...reactDoctorSettings,
    ...tailwindcssUiSettings,
  },
})
