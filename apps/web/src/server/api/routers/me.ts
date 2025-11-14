import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const meRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    // Remember to write a new query if you want to return something different than what
    // the authMiddleware in protectedProcedure returns.
    return ctx.session.userId
  }),
})
