/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc'
import { postRouter } from './post/post.router'
import { meRouter } from './me/me.router'
import { imageUploadRouter } from './imageUpload/imageUpload.router'
import { commentRouter } from './comment/comment.router'
import { authRouter } from './auth/auth.router'

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  me: meRouter,
  auth: authRouter,
  post: postRouter,
  comment: commentRouter,
  imageUpload: imageUploadRouter,
})

export type AppRouter = typeof appRouter
