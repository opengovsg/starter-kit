import { defineConfig } from 'oxlint'

import { jsxA11y, react } from '@acme/oxlint-config/presets.ts'
import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, react, jsxA11y, reactDoctor],
  jsPlugins: reactDoctor.jsPlugins,
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
  settings: reactDoctorSettings,
})
