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

const sortSources = (sources: string[]): string[] => [...sources].toSorted()

/**
 * Merges multiple security policies into a single policy string.
 */
export const generateCspHeader = (policies: CspPolicy[]): string => {
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

  const baseDirectives = cspPolicyKeys.flatMap((key) => {
    const sources = merged[key]

    if (sources === undefined) {
      return []
    }

    return [`${key} ${sortSources(sources).join(' ')}`]
  })

  return [...baseDirectives, 'upgrade-insecure-requests'].join('; ')
}

export const defaultCspPolicy: CspPolicy = {
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

export const vercelLiveCspPolicy: CspPolicy = {
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
