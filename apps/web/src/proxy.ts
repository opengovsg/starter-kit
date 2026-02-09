import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { env } from '~/env'

export function proxy(request: NextRequest) {
  const isDev = env.NODE_ENV === 'development' || env.NODE_ENV === 'test'

  // Read more on how to use this nonce with custom scripts:
  // https://nextjs.org/docs/app/guides/content-security-policy#reading-the-nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Update the headers as required, e.g. to allow Datadog RUM, Vercel Insights, Google Analytics, etc.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''};
    style-src 'self';
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    img-src * data: blob:;
    form-action 'self';
    frame-src *;
    frame-ancestors *;
    connect-src 'self' https://vitals.vercel-insights.com/v1/vitals;
    ${isDev ? '' : 'upgrade-insecure-requests;'}
`

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  )

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  )

  return response
}

// This config plus `proxyClientMaxBodySize` in `next.config.js` will ensure that spammy large requests are blocked.
// If you require a larger body size, increase `proxyClientMaxBodySize` accordingly.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    // Not combined with the above rule to avoid proxy bypassing for API requests with specific headers
    '/(api)(.*)',
  ],
}
