import { addCommentSchema } from '~/schemas/comment'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultCommentSelect } from './comment.select'

export const commentRouter = router({
  add: protectedProcedure
    .input(addCommentSchema)
    .mutation(async ({ input: { postId, ...input }, ctx }) => {
      const comment = await ctx.prisma.comment.create({
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
      })
      return comment
    }),
})
