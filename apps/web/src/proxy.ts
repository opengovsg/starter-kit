import type { NextRequest } from 'next/server'

import { NextResponse } from 'next/server'

interface CspPolicy {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'font-src'?: string[]
  'object-src'?: string[]
  'base-uri'?: string[]
  'img-src'?: string[]
  'form-action'?: string[]
  'frame-src'?: string[]
  'frame-ancestors'?: string[]
  'connect-src'?: string[]
}

/**
 * Merges multiple security policies into a single policy string.
 */
function generateCspHeader(policies: CspPolicy[]): string {
  const combined = policies.reduce((combined, policy) => {
    Object.keys(policy).forEach((_directive) => {
      const directive = _directive as keyof CspPolicy
      const sources = Array.from(
        new Set([...(combined[directive] ?? []), ...(policy[directive] ?? [])])
      )
      combined[directive] = sources
    })

    return combined
  }, {})

  const baseDirectives = Object.entries(combined).map(
    ([directive, sources]) =>
      `${directive} ${(sources as string[]).sort().join(' ')}`
  )

  return [...baseDirectives, 'upgrade-insecure-requests'].join('; ')
}

const defaultPolicy: CspPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'connect-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'self'"],
}

const vercelLivePolicy = {
  'connect-src': [
    'https://vercel.live',
    'https://*.pusher.com',
    'wss://*.pusher.com',
  ],
  'img-src': ['https://vercel.com'],
  'script-src': ['https://vercel.live'],
  'style-src': ['https://vercel.live'],
  'font-src': ['https://vercel.live'],
  'frame-src': ['https://vercel.live'],
}

export function proxy(request: NextRequest) {
  // oxlint-disable-next-line no-restricted-properties
  const isVercelPreview = process.env.VERCEL_ENV === 'preview'
  const isDev =
    // oxlint-disable-next-line no-restricted-properties
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

  // Read more on how to use this nonce with custom scripts:
  // https://nextjs.org/docs/app/guides/content-security-policy#reading-the-nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Update the headers as required, e.g. to allow Datadog RUM, Vercel Insights, Google Analytics, etc.
  const cspHeader = generateCspHeader([
    defaultPolicy,
    { 'script-src': [`'nonce-${nonce}'`] },
    isVercelPreview ? vercelLivePolicy : {},
    isDev ? { 'script-src': ["'unsafe-eval'"] } : {},
  ])

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
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
