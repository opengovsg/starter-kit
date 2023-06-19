/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const { env } = await import('./src/env.mjs')
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
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "base-uri 'self';",
              "font-src 'self' https: data:;",
              "form-action 'self';",
              "frame-ancestors 'self';",
              `img-src 'self' https://vercel.live/ https://vercel.com https://sockjs-mt1.pusher.com/ data: blob: ${
                // For displaying images from R2
                env.R2_PUBLIC_HOSTNAME
                  ? `https://${env.R2_PUBLIC_HOSTNAME}`
                  : ''
              };`,
              'frame-src https://vercel.live/ https://vercel.com',
              "object-src 'none';",
              `script-src 'self' https://vercel.live/ https://vercel.com ${
                env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''
              };`,
              "script-src-attr 'none';",
              "style-src 'self' https: 'unsafe-inline';",
              `connect-src 'self' https://*.browser-intake-datadoghq.com https://vitals.vercel-insights.com/v1/vitals https://vercel.live/ https://vercel.com https://sockjs-mt1.pusher.com/ wss://ws-mt1.pusher.com/ ${
                // For POSTing presigned URLs to R2 storage.
                env.R2_S3_CSP_PATTERN || ''
              };`,
              "worker-src 'self' blob:;",
              'upgrade-insecure-requests',
            ].join(''),
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
            value: 'no-referrer',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
        ],
      },
    ]
  },
}

export default config
