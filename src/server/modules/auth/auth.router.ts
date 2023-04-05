import { publicProcedure, router } from '~/server/trpc'
import { emailSessionRouter } from './email/email.router'

export const authRouter = router({
  email: emailSessionRouter,
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session?.destroy()
    return { isLoggedIn: false }
  }),
})
