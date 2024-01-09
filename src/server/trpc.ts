/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */

import superjson from 'superjson'
import { ZodError } from 'zod'
import { type Context } from './context'
import { TRPCError, initTRPC } from '@trpc/server'
import { prisma } from './prisma'
import { createBaseLogger } from '~/lib/logger'
import getIP from '~/utils/getClientIp'
import { type OpenApiMeta } from 'trpc-openapi'
import { defaultMeSelect } from './modules/me/me.select'
import { env } from '~/env.mjs'
import { APP_VERSION_HEADER_KEY } from '~/constants/version'

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({
    /**
     * @see https://trpc.io/docs/v10/data-transformers
     */
    transformer: superjson,
    /**
     * @see https://trpc.io/docs/v10/error-formatting
     */
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
        },
      }
    },
  })

// Setting outer context with tRPC will not get us correct path during request batching,
// only by setting logger context in the middleware do we get the exact path to log
const loggerMiddleware = t.middleware(async ({ path, next, ctx, type }) => {
  const start = Date.now()
  const logger = createBaseLogger({ path, clientIp: getIP(ctx.req) })

  const result = await next({
    ctx: { logger },
  })

  const durationInMs = Date.now() - start

  if (result.ok) {
    logger.info({ durationInMs }, `[${type}]: ${path} - ${durationInMs}ms - OK`)
  } else {
    logger.error(
      {
        durationInMs,
        err: result.error,
      },
      `[${type}]: ${path} - ${durationInMs}ms - ${result.error.code} ${result.error.message}`,
    )
  }

  return result
})

const loggerWithVersionMiddleware = loggerMiddleware.unstable_pipe(
  async ({ next, ctx }) => {
    const { req, res, logger } = ctx

    const serverVersion = env.NEXT_PUBLIC_APP_VERSION
    const clientVersion = req.headers[APP_VERSION_HEADER_KEY.toLowerCase()]

    if (clientVersion && serverVersion !== clientVersion) {
      logger.warn('Application version mismatch', {
        clientVersion,
        serverVersion,
      })
    } else if (!clientVersion) {
      logger.warn('Client version not available', {
        serverVersion,
      })
    }

    res.setHeader(APP_VERSION_HEADER_KEY, serverVersion)

    return next()
  },
)

const baseMiddleware = t.middleware(async ({ ctx, next }) => {
  if (ctx.session === undefined) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  })
})

const authMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // this code path is needed if a user does not exist in the database as they were deleted, but the session was active before
  const user = await prisma.user.findUnique({
    where: { id: ctx.session.userId },
    select: defaultMeSelect,
  })

  if (user === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      user,
    },
  })
})

const nonStrictAuthMiddleware = t.middleware(async ({ next, ctx }) => {
  // this code path is needed if a user does not exist in the database as they were deleted, but the session was active before
  const user = ctx.session?.userId
    ? await prisma.user.findUnique({
        where: { id: ctx.session.userId },
        select: defaultMeSelect,
      })
    : null

  return next({
    ctx: {
      user,
    },
  })
})

/**
 * Create a router
 * @see https://trpc.io/docs/v10/router
 */
export const router = t.router

/**
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v10/procedures
 **/
export const publicProcedure = t.procedure
  .use(loggerWithVersionMiddleware)
  .use(baseMiddleware)

/**
 * Create a protected procedure
 **/
export const protectedProcedure = t.procedure
  .use(loggerWithVersionMiddleware)
  .use(authMiddleware)

export const agnosticProcedure = t.procedure
  .use(loggerWithVersionMiddleware)
  .use(nonStrictAuthMiddleware)

/**
 * @see https://trpc.io/docs/v10/middlewares
 */
export const middleware = t.middleware

/**
 * @see https://trpc.io/docs/v10/merging-routers
 */
export const mergeRouters = t.mergeRouters
