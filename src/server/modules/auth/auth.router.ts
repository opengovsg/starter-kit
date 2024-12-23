import { publicProcedure, router } from '~/server/trpc'
import { emailSessionRouter } from './email/email.router'
import { sgidRouter } from './sgid/sgid.router'
import { oktaRouter } from '~/server/modules/auth/okta/okta.router'

export const authRouter = router({
  email: emailSessionRouter,
  sgid: sgidRouter,
  okta: oktaRouter,
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.session.destroy()
    return { isLoggedIn: false }
  }),
})
