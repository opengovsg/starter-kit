import { z } from 'zod'
import { protectedProcedure, router } from '~/server/trpc'

export const profileRouter = router({
  checkUsernameExists: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { username: input },
      })
      return !!user
    }),
})
