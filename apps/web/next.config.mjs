/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const { env } = await import('./src/env.mjs')

const ContentSecurityPolicy = `
  default-src 'none';
  base-uri 'self';
  font-src 'self' https: data:;
  form-action 'self';
  frame-ancestors 'self';
  img-src 'self' data: blob: ${
    // For displaying images from R2
    env.R2_PUBLIC_HOSTNAME ? `https://${env.R2_PUBLIC_HOSTNAME}` : ''
  };
  frame-src 'self';
  object-src 'none';
  script-src 'self' ${env.NODE_ENV === 'production' ? '' : "'unsafe-eval'"};
  style-src 'self' https: 'unsafe-inline';
  connect-src 'self' https://browser-intake-datadoghq.com https://*.browser-intake-datadoghq.com https://vitals.vercel-insights.com/v1/vitals ${
    // For POSTing presigned URLs to R2 storage.
    env.R2_ACCOUNT_ID
      ? `https://*.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : ''
  };
  worker-src 'self' blob:;
  ${env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : ''}
`

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
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
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
