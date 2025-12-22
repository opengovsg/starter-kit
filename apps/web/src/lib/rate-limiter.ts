import { TRPCError } from '@trpc/server'
import Redis from 'ioredis'
import {
  BurstyRateLimiter,
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
} from 'rate-limiter-flexible'

import { env } from '~/env'

export const RATE_LIMIT_NAMESPACE_KEY = 'rate-limit:'
export const RATE_LIMIT_BURST_NAMESPACE_KEY = 'rate-limit-burst:'

export interface RateLimiterConfig {
  /** Points to consume per request */
  points?: number
  /** Duration window in seconds */
  duration?: number
  /** Burst points for handling traffic spikes */
  burstPoints?: number
  /** Burst duration window in seconds */
  burstDuration?: number
  /** Custom key prefix for namespacing different rate limiters */
  keyPrefix?: string
}

const defaultConfig: Required<RateLimiterConfig> = {
  points: 60,
  duration: 30,
  burstPoints: 60,
  burstDuration: 60,
  keyPrefix: 'app',
}

// Singleton Redis client - lazily initialized
let redisClient: Redis | null = null

const getRedisClient = (): Redis | null => {
  if (!env.REDIS_URL) {
    return null
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) return null // Stop retrying after 3 attempts
        return Math.min(times * 100, 3000)
      },
      lazyConnect: true,
    })

    redisClient.on('error', (err: Error) => {
      console.error('[RateLimiter] Redis error:', err.message)
    })
  }

  return redisClient
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

  const redis = getRedisClient()

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
 * Extract rate limit key from context
 * Uses userId if available, otherwise falls back to IP from headers
 */
const getRateLimitKey = (opts: {
  session?: { userId?: string }
  headers: Headers
}): string => {
  const { session, headers } = opts

  if (session?.userId) {
    return `userId:${session.userId}`
  }

  // Fallback to IP address
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return `ip:${forwardedFor.split(',')[0]?.trim() ?? 'unknown'}`
  }

  if (realIp) {
    return `ip:${realIp}`
  }

  return 'ip:unknown'
}

/**
 * Rate limit check function for use in tRPC procedures
 *
 * @example
 * // In a tRPC procedure:
 * export const myProcedure = publicProcedure
 *   .mutation(async ({ ctx }) => {
 *     await checkRateLimit({
 *       key: getRateLimitKey(ctx),
 *       config: { points: 10, duration: 60 }
 *     })
 *     // ... rest of the procedure
 *   })
 */
export const checkRateLimit = async ({
  key,
  config = {},
  pointsToConsume = 1,
}: {
  key: string
  config?: RateLimiterConfig
  pointsToConsume?: number
}): Promise<RateLimiterRes> => {
  const limiter = createRateLimiter(config)

  try {
    return await limiter.consume(key, pointsToConsume)
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.',
        cause: {
          retryAfterMs: error.msBeforeNext,
          retryAfterSeconds: Math.ceil(error.msBeforeNext / 1000),
        },
      })
    }
    throw error
  }
}

/**
 * Create a rate limit middleware for tRPC procedures
 *
 * @example
 * // Create a rate-limited procedure
 * const rateLimitedProcedure = publicProcedure.use(
 *   createRateLimitMiddleware({ points: 10, duration: 60 })
 * )
 */
export const createRateLimitMiddleware = (config?: RateLimiterConfig) => {
  return async <
    TContext extends { session?: { userId?: string }; headers: Headers },
  >({
    ctx,
    next,
  }: {
    ctx: TContext
    next: () => Promise<unknown>
  }) => {
    const key = getRateLimitKey(ctx)
    await checkRateLimit({ key, config })
    return next()
  }
}

/**
 * Cleanup function to close Redis connection
 * Call this during application shutdown
 */
export const closeRateLimiterConnection = async (): Promise<void> => {
  if (redisClient?.status === 'ready') {
    try {
      await redisClient.quit()
      redisClient = null
    } catch (err) {
      console.error('[RateLimiter] Failed to close Redis connection:', err)
    }
  }
}
