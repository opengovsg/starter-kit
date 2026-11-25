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
  burstDuration: 10,
  burstPoints: 5,
  duration: 1,
  keyPrefix: 'app',
  points: 2,
}

// Cache for rate limiters by config
const rateLimiterCache = new Map<string, BurstyRateLimiter>()

export const createRateLimiter = (
  config: RateLimiterConfig
): BurstyRateLimiter => {
  const mergedConfig = { ...defaultConfig, ...config }
  const cacheKey = JSON.stringify(mergedConfig)

  const cached = rateLimiterCache.get(cacheKey)

  if (cached) {
    return cached
  }

  // In-memory fallback limiter
  const memoryLimiter = new RateLimiterMemory({
    duration: mergedConfig.duration,
    points: mergedConfig.points,
  })

  // If no Redis, use memory-only limiter
  if (!redis) {
    const memoryBurstLimiter = new RateLimiterMemory({
      duration: mergedConfig.burstDuration,
      points: mergedConfig.burstPoints,
    })

    const limiter = new BurstyRateLimiter(memoryLimiter, memoryBurstLimiter)
    rateLimiterCache.set(cacheKey, limiter)

    return limiter
  }

  const limiter = new BurstyRateLimiter(
    new RateLimiterRedis({
      duration: mergedConfig.duration,
      insuranceLimiter: memoryLimiter,
      keyPrefix: `${RATE_LIMIT_NAMESPACE_KEY}${mergedConfig.keyPrefix}:`,
      points: mergedConfig.points,
      rejectIfRedisNotReady: true,
      storeClient: redis,
    }),
    new RateLimiterRedis({
      duration: mergedConfig.burstDuration,
      insuranceLimiter: new RateLimiterMemory({
        duration: mergedConfig.burstDuration,
        points: mergedConfig.burstPoints,
      }),
      keyPrefix: `${RATE_LIMIT_BURST_NAMESPACE_KEY}${mergedConfig.keyPrefix}:`,
      points: mergedConfig.burstPoints,
      rejectIfRedisNotReady: true,
      storeClient: redis,
    })
  )

  rateLimiterCache.set(cacheKey, limiter)

  return limiter
}
