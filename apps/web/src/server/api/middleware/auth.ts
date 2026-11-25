import { TRPCError } from '@trpc/server'

import { t } from '../trpc-init'

export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (ctx.session.userId === undefined || ctx.session.userId === '') {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return await next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, userId: ctx.session.userId },
    },
  })
})
