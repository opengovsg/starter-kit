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
    globalSetup: 'vitest.global-setup.ts',
    setupFiles: ['tests/integration/__mocks__/prisma.ts'],
    coverage: {
      provider: 'istanbul',
      reportOnFailure: true,
    },
  },
})
