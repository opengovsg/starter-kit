import { TRPCError } from '@trpc/server'
import { addCommentSchema } from '~/schemas/comment'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultCommentSelect } from './comment.select'

export const commentRouter = router({
  add: protectedProcedure
    .input(addCommentSchema)
    .mutation(async ({ input: { postId, ...input }, ctx }) => {
      const reply = await ctx.prisma.$transaction(async (tx) => {
        const parent = await tx.post.findFirst({
          where: {
            id: postId,
            deletedAt: null,
          },
        })
        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Post '${postId}' does not exist`,
          })
        }
        const reply = await ctx.prisma.post.create({
          data: {
            ...input,
            author: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            parent: {
              connect: {
                id: postId,
              },
            },
          },
          select: defaultCommentSelect,
        })
        return reply
      })

      return reply
    }),
})
