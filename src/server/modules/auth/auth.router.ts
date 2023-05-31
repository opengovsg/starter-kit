import { publicProcedure, router } from '~/server/trpc'
import { emailSessionRouter } from './email/email.router'
import { sgidRouter } from './sgid/sgid.router'

export const authRouter = router({
  email: emailSessionRouter,
  sgid: sgidRouter,
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session?.destroy()
    return { isLoggedIn: false }
  }),
})
