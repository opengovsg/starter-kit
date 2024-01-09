import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultProfileSelect } from './profile.select'

export const profileRouter = router({
  byUsername: protectedProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.user.findUnique({
        where: { username: input.username },
        select: defaultProfileSelect,
      })
      if (!profile) {
        throw new TRPCError({
          message: `No user with username '${input.username}'`,
          code: 'NOT_FOUND',
        })
      }
      return profile
    }),
  checkUsernameExists: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { username: input },
      })
      return !!user
    }),
  checkEmailExists: protectedProcedure
    .input(z.string().email())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input },
      })
      return !!user
    }),
})
