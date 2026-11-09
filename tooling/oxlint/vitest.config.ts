import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // RuleTester registers through global describe/it.
    globals: true,
    include: ['plugin/**/*.test.ts'],
  },
})
