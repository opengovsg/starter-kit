/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { protectedProcedure, router } from '~/server/trpc'

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    // Remember to write a new query if you want to return something different than what
    // the authMiddleware in protectedProcedure returns.
    return ctx.user
  }),
})
