/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { z } from 'zod'
import { env } from '~/server/env'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultUserSelect } from '~/server/modules/user/user.select'
import { updateMeSchema } from '~/schemas/me'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: defaultUserSelect,
    })
  }),
  updateAvatar: protectedProcedure
    .input(
      z.object({
        imageKey: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          image: `https://${env.R2_PUBLIC_HOSTNAME}/${input.imageKey}`,
        },
        select: defaultUserSelect,
      })
    }),
  update: protectedProcedure
    .input(updateMeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: input,
          select: defaultUserSelect,
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new TRPCError({
              message: 'That username has been taken. Please choose another.',
              code: 'CONFLICT',
              cause: e,
            })
          }
        }
        throw e
      }
    }),
})
