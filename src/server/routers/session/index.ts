import { publicProcedure, router } from '~/server/trpc'
import { emailSessionRouter } from './email'

export const sessionRouter = router({
  email: emailSessionRouter,
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session?.destroy()
    return { isLoggedIn: false }
  }),
})
