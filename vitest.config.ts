import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    silent: true,
    projects: ['packages/*', 'apps/*', 'tooling/oxlint'],
    globals: true,
    exclude: ['node_modules', 'dist', '.turbo'],
    coverage: {
      enabled: process.env.CI === 'true',
      reporter: ['text', 'json', 'html'],
    },
  },
})
