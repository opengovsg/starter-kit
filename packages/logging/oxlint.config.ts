import { defineConfig } from 'oxlint'

import { e18e } from '@acme/oxlint-config/e18e.ts'
import { vitest } from '@acme/oxlint-config/presets.ts'
import sharedConfig, { oxlintOptions } from '@acme/oxlint-config/shared.ts'

export default defineConfig({
  extends: [sharedConfig, vitest, e18e],
  options: oxlintOptions,
  overrides: [
    {
      files: ['**/*.{test,spec}.{ts,tsx}', '**/__tests__/**'],
      rules: {
        'vitest/no-restricted-vi-methods': [
          'error',
          {
            waitFor:
              'Do not poll with vi.waitFor. Await the real event or assertion.',
          },
        ],
      },
    },
  ],
})
