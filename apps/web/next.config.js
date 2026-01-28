import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
/** @type {{ env: import("./src/env").Env }} */
const { env } = await jiti.import('./src/env')

const CSP = `
  default-src 'none';
  base-uri 'self';
  font-src 'self' https: data:;
  form-action 'self';
  frame-ancestors 'self';
  img-src 'self' data: blob: https:;
  frame-src 'self';
  object-src 'none';
  script-src 'self' ${
    env.NODE_ENV === 'development' || env.NODE_ENV === 'test'
      ? "'unsafe-eval' 'unsafe-inline'"
      : ''
  };
  style-src 'self' https: 'unsafe-inline';
  connect-src 'self';
  worker-src 'self' blob:;
  ${env.NODE_ENV === 'development' || env.NODE_ENV === 'test' ? '' : 'upgrade-insecure-requests'}
`

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

  /** Set up security headers */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: CSP.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Origin-Agent-Cluster',
            value: '?1',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

export default config
