import { meRouter } from '~/server/api/routers/me.router'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { healthcheck } from '../modules/healthcheck/healthcheck.service'
import { authRouter } from './routers/auth/auth.router'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // TODO: Add logger for healthcheck failures
  healthcheck: publicProcedure
    .meta({
      // Allow higher rate limit for healthchecks
      rateLimitOptions: {
        points: 10,
        duration: 1,
      },
    })
    .query(() => healthcheck()),
  me: meRouter,
  auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
