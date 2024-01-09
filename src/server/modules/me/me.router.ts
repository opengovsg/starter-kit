/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { z } from 'zod'
import { env } from '~/env.mjs'
import { protectedProcedure, router } from '~/server/trpc'
import { updateMeSchema } from '~/schemas/me'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { defaultMeSelect } from './me.select'

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.user.id },
      select: defaultMeSelect,
    })
  }),
  updateAvatar: protectedProcedure
    .input(
      z.object({
        imageKey: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          image: `https://${env.R2_PUBLIC_HOSTNAME}/${input.imageKey}`,
        },
        select: defaultMeSelect,
      })
    }),
  update: protectedProcedure
    .input(updateMeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: input,
          select: defaultMeSelect,
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            ctx.logger.info('Username conflict', {
              userId: ctx.user.id,
              chosen: input.username,
              current: ctx.user.username,
            })

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
