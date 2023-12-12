import { TRPCError } from '@trpc/server'
import { env } from '~/env.mjs'
import { addReplySchema } from '~/schemas/thread'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultReplySelect } from './thread.select'

export const threadRouter = router({
  reply: protectedProcedure
    .input(addReplySchema)
    .mutation(async ({ input, ctx }) => {
      const { postId, imageKeys, ...replyData } = input
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
        const images = env.NEXT_PUBLIC_ENABLE_STORAGE
          ? imageKeys?.map((key) => `https://${env.R2_PUBLIC_HOSTNAME}/${key}`)
          : []
        return await ctx.prisma.post.create({
          data: {
            ...replyData,
            images,
            author: {
              connect: {
                id: ctx.user.id,
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
