import { createTRPCRouter, publicProcedure } from '../../trpc'
import { emailAuthRouter } from './auth.email.router'

export const authRouter = createTRPCRouter({
  email: emailAuthRouter,
  logout: publicProcedure.mutation(({ ctx }) => {
    const { sessionId, userId } = ctx.session
    ctx.session.destroy()
    if (sessionId && userId) {
      ctx.logger.audit.authn.sessionTerminated({
        sessionId,
        userId,
        reason: 'logout',
      })
    }
    return
  }),
})
