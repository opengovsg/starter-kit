import { meRouter } from '~/server/api/routers/me'
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from '~/server/api/trpc'
import { authRouter } from './routers/auth/auth.router'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => 'alive!'),
  me: meRouter,
  auth: authRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
