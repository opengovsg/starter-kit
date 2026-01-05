import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    silent: true,
    retry: 0,
    globals: true,
    environment: 'node',
    exclude: ['node_modules', 'dist', '.next', '.turbo', 'tests/e2e'],
    coverage: {
      enabled: process.env.CI === 'true',
      reporter: ['text', 'json', 'html'],
    },
    globalSetup: 'tests/global-setup.ts',
    setupFiles: ['tests/db/setup.ts', 'tests/redis/setup.ts'],
    env: {
      // Add any other test specific environment variables here.
      // These environment variables will still be validated against the schema in `env.ts`.
      DATABASE_URL: 'postgresql://root:root@localhost:54321/willbeoverridden',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      SESSION_SECRET: 'thisisasecretthatshouldbeatleast32characters!',
    },
  },
})
