/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { postRouter } from './post';
import { meRouter } from './me';
import { imageUploadRouter } from './imageUpload';
import { commentRouter } from './comment';
import { readPostRouter } from './readPost';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  post: postRouter,
  readPost: readPostRouter,
  comment: commentRouter,
  me: meRouter,
  imageUpload: imageUploadRouter,
});

export type AppRouter = typeof appRouter;
