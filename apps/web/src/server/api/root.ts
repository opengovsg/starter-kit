import { healthcheck } from '../modules/healthcheck/healthcheck.service'
import { authRouter } from './routers/auth/auth.router'

import { meRouter } from '~/server/api/routers/me.router'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  healthcheck: publicProcedure
    .meta({
      // Allow higher rate limit for healthchecks
      rateLimitOptions: {
        duration: 1,
        points: 10,
      },
    })
    .query(async () => await healthcheck()),
  me: meRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
