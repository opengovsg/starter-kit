/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { updateMeSchema } from '../schemas/me';
import { protectedProcedure, router } from '../trpc';

/**
 * Default selector for User.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultMeSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  title: true,
  email: true,
  emailVerified: true,
  image: true,
  name: true,
});

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: defaultMeSelect,
    });
  }),
  updateAvatar: protectedProcedure
    .input(
      z.object({
        image: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          image: input.image,
        },
        select: defaultMeSelect,
      });
    }),
  update: protectedProcedure
    .input(updateMeSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: defaultMeSelect,
      });
    }),
});
