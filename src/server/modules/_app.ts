/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc'
import { postRouter } from './post/post.router'
import { meRouter } from './me/me.router'
import { storageRouter } from './storage/storage.router'
import { authRouter } from './auth/auth.router'
import { threadRouter } from './thread/thread.router'
import { profileRouter } from './profile/profile.router'

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  me: meRouter,
  auth: authRouter,
  profile: profileRouter,
  post: postRouter,
  thread: threadRouter,
  storage: storageRouter,
})

export type AppRouter = typeof appRouter
