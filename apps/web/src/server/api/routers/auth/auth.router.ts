import { createTRPCRouter, publicProcedure } from '../../trpc'
import { emailAuthRouter } from './auth.email.router'

export const authRouter = createTRPCRouter({
  email: emailAuthRouter,
  logout: publicProcedure.mutation(({ ctx }) => {
    const { sessionId, userId } = ctx.session
    ctx.session.destroy()

    if (userId !== undefined && userId !== '') {
      const auditSessionId =
        sessionId !== undefined && sessionId !== ''
          ? sessionId
          : crypto.randomUUID()

      ctx.logger.audit.authn.sessionTerminated({
        reason: 'logout',
        sessionId: auditSessionId,
        userId,
      })
    }
  }),
})
