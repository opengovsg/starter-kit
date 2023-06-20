/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const { env } = await import('./src/env.mjs')
import { nextSafe } from 'next-safe'

const isDev = env.NODE_ENV !== 'production'

/**
 * @link https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /**
   * Dynamic configuration available for the browser and server.
   * Note: requires `ssr: true` or a `getInitialProps` in `_app.tsx`
   * @link https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
   */
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV,
  },
  /** We run eslint as a separate task in CI */
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  images: {
    domains: [env.R2_PUBLIC_HOSTNAME ?? ''].filter((d) => d),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: nextSafe({
          isDev,
          contentSecurityPolicy: {
            mergeDefaultDirectives: true,
            'img-src': [
              'data:',
              'blob:',
              // For displaying images from R2
              env.R2_PUBLIC_HOSTNAME ? `https://${env.R2_PUBLIC_HOSTNAME}` : '',
            ],
            'style-src': ["'unsafe-inline'", 'https:'],
            'connect-src': [
              'https://*.browser-intake-datadoghq.com',
              'https://vitals.vercel-insights.com/v1/vitals',
              // For POSTing presigned URLs to R2 storage.
              env.R2_S3_CSP_PATTERN || '',
            ],
          },
        }),
      },
    ]
  },
}

export default config
