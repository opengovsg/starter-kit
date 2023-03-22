/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { z } from 'zod';
import { defaultUserSelect } from '../modules/user/user.select';
import { updateMeSchema } from '../schemas/me';
import { protectedProcedure, router } from '../trpc';

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: defaultUserSelect,
    });
  }),
  updateAvatar: protectedProcedure
    .input(
      z.object({
        image: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          image: input.image,
        },
        select: defaultUserSelect,
      });
    }),
  update: protectedProcedure
    .input(updateMeSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: defaultUserSelect,
      });
    }),
});
