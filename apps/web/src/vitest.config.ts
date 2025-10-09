import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    // globalSetup: "tests/global-setup.ts",
    // setupFiles: [
    //   "tests/db/setup.ts",
    //   "tests/redis/setup.ts",
    //   "tests/weaviate/setup.ts",
    // ],
  },
})
