import { z } from 'zod'
import { protectedProcedure, router } from '~/server/trpc'

export const profileRouter = router({
  checkEmailExists: protectedProcedure
    .input(z.string().email())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input },
      })
      return !!user
    }),
})
