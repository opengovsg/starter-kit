import { createTRPCRouter, publicProcedure } from '../../trpc'
import { emailAuthRouter } from './auth.email.router'

export const authRouter = createTRPCRouter({
  email: emailAuthRouter,
  logout: publicProcedure.mutation(({ ctx }) => {
    const { sessionId } = ctx.session
    ctx.session.destroy()
    if (sessionId) {
      ctx.logger.audit.authn.sessionTerminated({ sessionId, reason: 'logout' })
    }
    return
  }),
})
