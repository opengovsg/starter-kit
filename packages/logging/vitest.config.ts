import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      enabled: process.env.CI === 'true',
      // projectRoot makes lcov paths repo-relative so a single Datadog
      // coverage upload from the repo root maps files correctly.
      reporter: ['text', ['lcovonly', { projectRoot: '../..' }]],
    },
  },
})
