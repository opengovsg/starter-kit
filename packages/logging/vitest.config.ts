import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      enabled: process.env.CI === 'true',
      // lcov is what datadog-ci parses for the CI coverage upload
      reporter: ['text', 'lcov'],
    },
  },
})
