/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import { RateLimiterRes } from 'rate-limiter-flexible'
import superjson from 'superjson'
import z, { ZodError } from 'zod'

import type { Logger, ScopedLogger } from '@acme/logging'

import type { RateLimiterConfig } from '../modules/rate-limit/types'
import { env } from '~/env'
import { createLogger } from '~/lib/logger'
import {
  checkRateLimit,
  createRateLimitFingerprint,
} from '../modules/rate-limit/rate-limit.service'
import { getSession } from '../session'
import { extractIpAddress } from '../utils/request'

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async ({
  headers,
  resHeaders,
}: {
  headers: Headers
  // resHeaders may not exist if called directly from RSC without an active request
  resHeaders?: Headers
}) => {
  // Pass in base context
  // Logger is created in the context so functions relying on the context will
  // be provided a base logger even without `loggerMiddleware`, which adds the
  // the proper procedure path to the logs.
  // This is useful for functions such as a rate limiter middleware, which may
  // or may not have been chained with the logger middleware.
  const logger = createLogger({ path: 'trpc', headers })

  const session = await getSession()
  return {
    logger: logger as Logger | ScopedLogger,
    headers,
    session,
    resHeaders,
  }
}

interface Meta {
  // Rate limit options for this procedure. If null, rate limiting is disabled.
  // Defaults to empty object, which applies default rate limiting.
  rateLimitOptions?: RateLimiterConfig | null
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<Meta>()
  .create({
    defaultMeta: {
      rateLimitOptions: {},
    },
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError
              ? z.flattenError(error.cause)
              : null,
        },
      }
    },
  })

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

const loggerMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const start = performance.now()
  const logger = ctx.logger.createScopedLogger({ action: path })

  const result = await next({
    ctx: { logger },
  })

  const end = performance.now()

  const durationInMs = Math.round(end - start)

  if (result.ok) {
    logger.debug({
      message: `${path} took ${durationInMs}ms to execute`,
      merged: {
        durationInMs,
        statusCode: 200,
      },
    })
  } else {
    logger.error({
      merged: {
        durationInMs,
        statusCode: getHTTPStatusCodeFromError(result.error),
      },
      error: result.error,
      message: result.error.message,
    })
  }

  return result
})

const rateLimitMiddleware = t.middleware(async ({ ctx, next, meta }) => {
  const rateLimitOptions =
    meta?.rateLimitOptions === undefined ? {} : meta.rateLimitOptions
  if (rateLimitOptions === null) {
    return next()
  }

  if (env.NODE_ENV === 'test') {
    return next()
  }

  try {
    await checkRateLimit({
      key: createRateLimitFingerprint({
        ipAddress: extractIpAddress(ctx.headers),
        userId: ctx.session.userId,
      }),
      options: rateLimitOptions,
    })
    return next()
  } catch (error) {
    // Handle rate limit error separately to add rate limit headers
    if (error instanceof RateLimiterRes) {
      ctx.resHeaders?.set(
        'Retry-After',
        String(Math.ceil(error.msBeforeNext / 1000)),
      )
      ctx.resHeaders?.set(
        'X-RateLimit-Reset',
        String(Math.ceil((Date.now() + error.msBeforeNext) / 1000)),
      )
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.ceil(
          error.msBeforeNext / 1000,
        )} seconds.`,
      })
    }
    throw error
  }
})

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session.userId) {
    ctx.session.destroy()
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, userId: ctx.session.userId },
    },
  })
})

const defaultProcedure = t.procedure
  .use(loggerMiddleware)
  .use(rateLimitMiddleware)

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = defaultProcedure

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = defaultProcedure.use(authMiddleware)
