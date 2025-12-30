import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    silent: true,
    projects: ['packages/*', 'apps/*'],
    retry: 0,
    globals: true,
    exclude: ['node_modules', 'dist', '.turbo'],
    coverage: {
      enabled: process.env.CI === 'true',
      reporter: ['text', 'json', 'html'],
    },
  },
})
