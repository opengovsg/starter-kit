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

const cspPolicyKeys = [
  'base-uri',
  'connect-src',
  'default-src',
  'font-src',
  'form-action',
  'frame-ancestors',
  'frame-src',
  'img-src',
  'object-src',
  'script-src',
  'style-src',
] as const satisfies readonly (keyof CspPolicy)[]

const sortSources = (sources: string[]): string[] => {
  const copy = [...sources]
  // oxlint-disable-next-line unicorn/no-array-sort -- sorting a local copy for CSP header output.
  copy.sort()
  return copy
}

/**
 * Merges multiple security policies into a single policy string.
 */
const generateCspHeader = (policies: CspPolicy[]): string => {
  const merged: CspPolicy = {}

  for (const policy of policies) {
    for (const key of cspPolicyKeys) {
      const sources = policy[key]
      if (sources === undefined) {
        continue
      }
      merged[key] = [...new Set([...(merged[key] ?? []), ...sources])]
    }
  }

  const baseDirectives = cspPolicyKeys
    .filter((key) => merged[key] !== undefined)
    .map((key) => {
      const sources: string[] = merged[key] ?? []
      const sortedSources = sortSources(sources)
      return `${key} ${sortedSources.join(' ')}`
    })

  return [...baseDirectives, 'upgrade-insecure-requests'].join('; ')
}

const defaultPolicy: CspPolicy = {
  'base-uri': ["'self'"],
  'connect-src': ["'self'"],
  'default-src': ["'self'"],
  'font-src': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
}

const vercelLivePolicy = {
  'connect-src': [
    'https://vercel.live',
    'https://*.pusher.com',
    'wss://*.pusher.com',
  ],
  'font-src': ['https://vercel.live'],
  'frame-src': ['https://vercel.live'],
  'img-src': ['https://vercel.com'],
  'script-src': ['https://vercel.live'],
  'style-src': ['https://vercel.live'],
}

export const proxy = (request: NextRequest) => {
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
