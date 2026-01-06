import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import('./src/env')

/** @type {import("next").NextConfig} */
const config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    '@acme/db',
    '@acme/ui',
    '@acme/validators',
    '@acme/logging',
    '@acme/redis',
    '@acme/common',
  ],

  reactCompiler: true,

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },

  // If deploying to AWS, set output to 'standalone'
  output: undefined,
}

export default config
