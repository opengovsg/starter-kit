/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { z } from 'zod'
import { env } from '~/env.mjs'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultUserSelect } from '~/server/modules/user/user.select'
import { updateMeSchema } from '~/schemas/me'

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
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
      return ctx.prisma.user.update({
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
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: defaultUserSelect,
      })
    }),
})
