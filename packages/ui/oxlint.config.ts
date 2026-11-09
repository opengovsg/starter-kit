import { defineConfig } from 'oxlint'

import { react } from '@acme/oxlint-config/presets.ts'
import { e18e, e18eJsPlugins, e18eSettings } from '@acme/oxlint-config/e18e.ts'
import {
  reactDoctor,
  reactDoctorSettings,
} from '@acme/oxlint-config/react-doctor.ts'
import sharedConfig from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, react, reactDoctor, e18e],
  jsPlugins: [...reactDoctor.jsPlugins, ...e18eJsPlugins],
  options: {
    reportUnusedDisableDirectives: 'off',
    typeAware: true,
  },
  settings: { ...reactDoctorSettings, ...e18eSettings },
})
