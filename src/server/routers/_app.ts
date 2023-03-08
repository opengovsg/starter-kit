/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { postRouter } from './post';
import { meRouter } from './me';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  post: postRouter,
  me: meRouter,
});

export type AppRouter = typeof appRouter;
