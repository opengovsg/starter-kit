import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: process.env.CI === 'true',
      // projectRoot makes lcov paths repo-relative so a single Datadog
      // coverage upload from the repo root maps files correctly.
      reporter: ['text', ['lcovonly', { projectRoot: '../..' }]],
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
