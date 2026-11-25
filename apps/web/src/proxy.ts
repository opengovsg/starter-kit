import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'

import { defaultCspPolicy, generateCspHeader, vercelLiveCspPolicy } from './csp'

export const proxy = (request: NextRequest) => {
  const isVercelPreview = process.env.VERCEL_ENV === 'preview'

  const isDev =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

  // Read more on how to use this nonce with custom scripts:
  // https://nextjs.org/docs/app/guides/content-security-policy#reading-the-nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Update the headers as required, e.g. to allow Datadog RUM, Vercel Insights, Google Analytics, etc.
  const cspHeader = generateCspHeader([
    defaultCspPolicy,
    { 'script-src': [`'nonce-${nonce}'`] },
    isVercelPreview ? vercelLiveCspPolicy : {},
    isDev ? { 'script-src': ["'unsafe-eval'"] } : {},
  ])

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replaceAll(/\s{2,}/gu, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
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
      missing: [
        { key: 'next-router-prefetch', type: 'header' },
        { key: 'purpose', type: 'header', value: 'prefetch' },
      ],
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
    },
    // Not combined with the above rule to avoid proxy bypassing for API requests with specific headers
    '/(api)(.*)',
  ],
}
