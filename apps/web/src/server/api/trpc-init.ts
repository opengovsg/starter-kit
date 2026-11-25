import { initTRPC } from '@trpc/server'
import { deserialize, serialize } from 'superjson'
import { z, ZodError } from 'zod'

import { deserializeInput } from './deserialize-input'

import { createLogger } from '~/lib/logger'
import type { RateLimiterConfig } from '~/server/modules/rate-limit/types'
import { getSession } from '~/server/session'

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
  const logger = createLogger({ headers, path: 'trpc' })

  const session = await getSession()

  return {
    headers,
    logger,
    resHeaders,
    session,
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
export const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<Meta>()
  .create({
    defaultMeta: {
      rateLimitOptions: {},
    },
    errorFormatter(opts) {
      const { error } = opts
      const formattedError = opts.shape

      return {
        ...formattedError,
        data: {
          ...formattedError.data,
          zodError:
            error.cause instanceof ZodError
              ? z.flattenError(error.cause)
              : null,
        },
      }
    },
    transformer: {
      input: {
        deserialize: deserializeInput,
        serialize,
      },
      output: {
        deserialize,
        serialize,
      },
    },
  })

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const { createCallerFactory } = t

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router
