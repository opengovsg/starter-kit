import { createMiddleware, createStart } from '@tanstack/react-start'

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

function generateCspHeader(policies: CspPolicy[]): string {
  const combined = policies.reduce<CspPolicy>((acc, policy) => {
    for (const _directive of Object.keys(policy)) {
      const directive = _directive as keyof CspPolicy
      acc[directive] = Array.from(
        new Set([...(acc[directive] ?? []), ...(policy[directive] ?? [])])
      )
    }
    return acc
  }, {})

  const directives = Object.entries(combined).map(
    ([directive, sources]) =>
      `${directive} ${(sources as string[]).sort().join(' ')}`
  )

  return [...directives, 'upgrade-insecure-requests'].join('; ')
}

const defaultPolicy: CspPolicy = {
  'default-src': ["'self'"],
  // 'unsafe-inline' is required because TanStack Start emits inline hydration
  // scripts that cannot be attributed to an external src. The previous Next.js
  // setup threaded a per-request nonce (crypto.randomUUID()) through the proxy
  // and used 'nonce-${nonce}' here instead, which is stricter. Remove
  // 'unsafe-inline' and restore nonce threading if TanStack Start gains a
  // nonce injection API.
  'script-src': ["'self'", "'unsafe-inline'"],
  'connect-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'self'"],
}

const vercelLivePolicy: CspPolicy = {
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

function buildCspValue(): string {
  // oxlint-disable-next-line no-restricted-properties
  const isVercelPreview = process.env.VERCEL_ENV === 'preview'
  const isDev =
    // oxlint-disable-next-line no-restricted-properties
    process.env.NODE_ENV === 'development' ||
    // oxlint-disable-next-line no-restricted-properties
    process.env.NODE_ENV === 'test'

  return generateCspHeader([
    defaultPolicy,
    isVercelPreview ? vercelLivePolicy : {},
    isDev ? { 'script-src': ["'unsafe-eval'"] } : {},
  ])
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const cspMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next()
  result.response.headers.set('Content-Security-Policy', buildCspValue())
  return result
})

export const startInstance = createStart(() => ({
  requestMiddleware: [cspMiddleware],
}))
