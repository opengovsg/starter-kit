import type { RateLimiterRes } from 'rate-limiter-flexible'
import {
  BurstyRateLimiter,
  RateLimiterMemory,
  RateLimiterRedis,
} from 'rate-limiter-flexible'

import { redis } from '@acme/redis'

import type { RateLimiterConfig } from '~/server/modules/rate-limit/types'

export const RATE_LIMIT_NAMESPACE_KEY = 'rate-limit:'
export const RATE_LIMIT_BURST_NAMESPACE_KEY = 'rate-limit-burst:'

/**
 * Defaults to 2 requests per second
 * and allows bursts of up to 5 requests per 10 seconds.
 *
 * This should be enough to allow normal usage.
 * Override them in specific cases as needed, such as if rate limiting by IP address only and
 * you foresee usage in a shared network environment.
 */
const defaultConfig: Required<RateLimiterConfig> = {
  points: 2,
  duration: 1,
  burstPoints: 5,
  burstDuration: 10,
  keyPrefix: 'app',
}

// Cache for rate limiters by config
const rateLimiterCache = new Map<string, BurstyRateLimiter>()

const createRateLimiter = (config: RateLimiterConfig): BurstyRateLimiter => {
  const mergedConfig = { ...defaultConfig, ...config }
  const cacheKey = JSON.stringify(mergedConfig)

  const cached = rateLimiterCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // In-memory fallback limiter
  const memoryLimiter = new RateLimiterMemory({
    points: mergedConfig.points,
    duration: mergedConfig.duration,
  })

  // If no Redis, use memory-only limiter
  if (!redis) {
    const memoryBurstLimiter = new RateLimiterMemory({
      points: mergedConfig.burstPoints,
      duration: mergedConfig.burstDuration,
    })

    const limiter = new BurstyRateLimiter(memoryLimiter, memoryBurstLimiter)
    rateLimiterCache.set(cacheKey, limiter)
    return limiter
  }

  const limiter = new BurstyRateLimiter(
    new RateLimiterRedis({
      storeClient: redis,
      rejectIfRedisNotReady: true,
      points: mergedConfig.points,
      duration: mergedConfig.duration,
      keyPrefix: `${RATE_LIMIT_NAMESPACE_KEY}${mergedConfig.keyPrefix}:`,
      insuranceLimiter: memoryLimiter,
    }),
    new RateLimiterRedis({
      storeClient: redis,
      rejectIfRedisNotReady: true,
      points: mergedConfig.burstPoints,
      duration: mergedConfig.burstDuration,
      keyPrefix: `${RATE_LIMIT_BURST_NAMESPACE_KEY}${mergedConfig.keyPrefix}:`,
      insuranceLimiter: new RateLimiterMemory({
        points: mergedConfig.burstPoints,
        duration: mergedConfig.burstDuration,
      }),
    }),
  )

  rateLimiterCache.set(cacheKey, limiter)
  return limiter
}

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
  return limiter.consume(key, pointsToConsume)
}

export const createRateLimitFingerprint = ({
  userId,
  ipAddress,
}: {
  userId: string | undefined
  ipAddress: string | null
}) => {
  if (userId) {
    return `userId:${userId}`
  }
  // Process IP address and replace colons so Redis keys stay compatible with the common
  // "namespace:subkey" convention and any tooling that treats ":" as a key separator.
  return `ip:${ipAddress?.replaceAll(':', '_') ?? 'unknown'}`
}
