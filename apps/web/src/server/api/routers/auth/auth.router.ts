import { createTRPCRouter, publicProcedure } from '../../trpc'
import { emailAuthRouter } from './auth.email.router'

import { readSessionState } from '~/server/session-state'

export const authRouter = createTRPCRouter({
  email: emailAuthRouter,
  logout: publicProcedure.mutation(({ ctx }) => {
    const state = readSessionState(ctx.session)
    ctx.session.destroy()

    if (state.kind === 'user' && state.sessionId !== undefined) {
      ctx.logger.audit.authn.sessionTerminated({
        reason: 'logout',
        sessionId: state.sessionId,
        userId: state.userId,
      })
    }
  }),
})
