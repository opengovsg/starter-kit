import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const meRouter = createTRPCRouter({
  get: protectedProcedure.query(() => {
    // Remember to write a new query if you want to return something different than what
    // the authMiddleware in protectedProcedure returns.
    return 'TODO: return user info here from ctx.session'
  }),
})
