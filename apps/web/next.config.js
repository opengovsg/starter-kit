import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import('./src/env')

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    // Limits body size in our endpoints.
    // Only affects route matches in proxy.ts, so you must be careful to not remove matches in that file
    // or the limit can be bypassed and cause OOM server crashes.
    proxyClientMaxBodySize: '2mb',
  },
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

  // If deploying to AWS, set deploymentId to a unique value for each deployment, e.g. from git sha or CI build number
  deploymentId: undefined,
  // If deploying to AWS, set output to 'standalone'
  output: undefined,
}

export default config
