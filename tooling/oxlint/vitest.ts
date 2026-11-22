import { defineConfig } from 'oxlint'
import vitestPreset from 'ultracite/oxlint/vitest'

export const vitest = defineConfig({
  extends: [vitestPreset],
  overrides: [
    {
      files: [
        '**/*.{test,spec,test-d,spec-d}.{ts,tsx,js,jsx,mts,cts,mjs,cjs}',
        '**/__tests__/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}',
      ],
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
