import { fileURLToPath } from 'url'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, '**/playwright/**', 'tests/load/**'],
    alias: {
      '~/': fileURLToPath(new URL('./src/', import.meta.url)),
      '~tests/': fileURLToPath(new URL('./tests/', import.meta.url)),
    },
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      provider: 'istanbul',
      reportOnFailure: true,
    },
  },
})
