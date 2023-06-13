/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { z } from 'zod'
import { env } from '~/env.mjs'
import { updateMeSchema } from '~/schemas/me'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultMeSelect } from './me.select'

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: defaultMeSelect,
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
        select: defaultMeSelect,
      })
    }),
  update: protectedProcedure
    .input(updateMeSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: defaultMeSelect,
      })
    }),
})
