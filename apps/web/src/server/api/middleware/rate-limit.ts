import { TRPCError } from '@trpc/server'
import { RateLimiterRes } from 'rate-limiter-flexible'

import { t } from '../trpc-init'

import { env } from '~/env'
import {
  checkRateLimit,
  createRateLimitFingerprint,
} from '~/server/modules/rate-limit/rate-limit.service'
import { extractIpAddress } from '~/server/utils/request'

export const rateLimitMiddleware = t.middleware(
  async ({ ctx, next, meta, path }) => {
    const rateLimitOptions =
      meta?.rateLimitOptions === undefined ? {} : meta.rateLimitOptions

    if (rateLimitOptions === null) {
      return await next()
    }

    if (env.NODE_ENV === 'test') {
      return await next()
    }

    try {
      await checkRateLimit({
        key: createRateLimitFingerprint({
          ipAddress: extractIpAddress(ctx.headers),
          path,
          userId: ctx.session.userId,
        }),
        options: rateLimitOptions,
      })

      return await next()
    } catch (error) {
      // Handle rate limit error separately to add rate limit headers
      if (error instanceof RateLimiterRes) {
        ctx.resHeaders?.set(
          'Retry-After',
          String(Math.ceil(error.msBeforeNext / 1000))
        )
        ctx.resHeaders?.set(
          'X-RateLimit-Reset',
          String(Math.ceil((Date.now() + error.msBeforeNext) / 1000))
        )
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Rate limit exceeded. Try again in ${Math.ceil(
            error.msBeforeNext / 1000
          )} seconds.`,
        })
      }

      throw error
    }
  }
)
