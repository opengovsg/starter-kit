import { TRPCError } from '@trpc/server'
import { addReplySchema } from '~/schemas/thread'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultReplySelect } from './thread.select'

export const threadRouter = router({
  reply: protectedProcedure
    .input(addReplySchema)
    .mutation(async ({ input, ctx }) => {
      const { postId, ...replyData } = input
      return await ctx.prisma.$transaction(async (tx) => {
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
        return await ctx.prisma.post.create({
          data: {
            ...replyData,
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
          select: defaultReplySelect,
        })
      })
    }),
})
