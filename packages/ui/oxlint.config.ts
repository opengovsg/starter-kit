import { defineConfig } from 'oxlint'

import { react } from '@acme/oxlint-config/presets.ts'
import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'
import {
  tailwindcssOxlint,
  tailwindcssUiSettings,
} from '@acme/oxlint-config/tailwindcss.ts'

export default defineConfig({
  extends: [sharedConfig, react, reactDoctor, tailwindcssOxlint],
  jsPlugins: reactDoctor.jsPlugins,
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
  settings: {
    ...reactDoctorSettings,
    ...tailwindcssUiSettings,
  },
})
