import { Prisma } from '@prisma/client';
import { prisma } from '~/server/prisma';
import { addCommentSchema } from '../schemas/comment';
import { protectedProcedure, router } from '../trpc';

/**
 * Default selector for Post.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  content: true,
  contentHtml: true,
  createdAt: true,
  authorId: true,
  author: {
    select: {
      image: true,
      name: true,
    },
  },
});

export const commentRouter = router({
  add: protectedProcedure
    .input(addCommentSchema)
    .mutation(async ({ input: { postId, ...input }, ctx }) => {
      const comment = await prisma.comment.create({
        data: {
          ...input,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
        select: defaultCommentSelect,
      });
      return comment;
    }),
});
