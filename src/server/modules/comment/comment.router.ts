import { TRPCError } from '@trpc/server'
import { addCommentSchema } from '~/schemas/comment'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultCommentSelect } from './comment.select'

export const commentRouter = router({
  add: protectedProcedure
    .input(addCommentSchema)
    .mutation(async ({ input: { postId, ...input }, ctx }) => {
      const comment = await ctx.prisma.$transaction(async (tx) => {
        const post = await tx.post.findFirst({
          where: {
            id: postId,
            deletedAt: null,
          },
        })
        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post '${postId}' does not exist`,
          })
        }
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
      })

      return comment
    }),
})
