import type { RateLimiterRes } from 'rate-limiter-flexible'

import { createRateLimiter } from './create-rate-limiter'

import type { RateLimiterConfig } from '~/server/modules/rate-limit/types'

export {
  RATE_LIMIT_BURST_NAMESPACE_KEY,
  RATE_LIMIT_NAMESPACE_KEY,
} from './create-rate-limiter'

export { createRateLimitFingerprint } from './fingerprint'

/**
 * Rate limit check function for use in tRPC middlewares
 *
 * @example
 * // In a tRPC middleware:
 * await checkRateLimit({
 *   key: getRateLimitKey(ctx),
 *   options: { points: 10, duration: 60 }
 * })
 */
export const checkRateLimit = async ({
  key,
  options = {},
  pointsToConsume = 1,
}: {
  key: string
  options?: RateLimiterConfig
  pointsToConsume?: number
}): Promise<RateLimiterRes> => {
  const limiter = createRateLimiter(options)

  return await limiter.consume(key, pointsToConsume)
}
