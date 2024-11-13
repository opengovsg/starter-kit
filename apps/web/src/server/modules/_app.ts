/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc'
import { authRouter } from './auth/auth.router'
import { meRouter } from './me/me.router'

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  me: meRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
