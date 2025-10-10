import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    retry: 0,
    globals: true,
    environment: 'node',
    exclude: ['node_modules', 'dist', '.turbo'],
    coverage: {
      enabled: process.env.CI === 'true',
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
    globalSetup: 'tests/global-setup.ts',
    setupFiles: [
      'tests/db/setup.ts',
      // 'tests/redis/setup.ts'
    ],
  },
})
