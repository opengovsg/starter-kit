import { type Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  addPostSchema,
  editPostSchema,
  type ListPostsInputSchema,
  listPostsInputSchema,
} from '~/schemas/post'
import { protectedProcedure, router } from '~/server/trpc'
import { defaultPostSelect, withCommentsPostSelect } from './post.select'
import { processFeedbackItem } from './post.util'

export const postRouter = router({
  list: protectedProcedure
    .input(listPostsInputSchema)
    .query(async ({ input, ctx: { prisma, logger, session } }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 50
      const { cursor } = input

      const getFilterWhereClause = (
        filter: ListPostsInputSchema['filter']
      ): Prisma.PostWhereInput => {
        switch (filter) {
          case 'all':
            return {}
          case 'unread':
            return {
              NOT: {
                readBy: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            }
          case 'replied':
            return {
              replies: {
                some: {},
              },
            }
          case 'repliedByMe':
            return {
              replies: {
                some: {
                  authorId: session.user.id,
                },
              },
            }
          case 'unreplied':
            return {
              replies: {
                none: {},
              },
            }
          case 'unrepliedByMe':
            return {
              replies: {
                none: {
                  authorId: session.user.id,
                },
              },
            }
        }
      }

      const items = await prisma.post.findMany({
        select: withCommentsPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: input.order,
        },
        where: {
          ...getFilterWhereClause(input.filter),
          parentPostId: null,
          deletedAt: null,
        },
      })
      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!
        nextCursor = nextItem.id
      }

      const processedItems = items
        .map((item) => processFeedbackItem(item, session.user.id))
        .reverse()

      logger.info('Items successfully retrieved', {
        ids: processedItems.map((item) => item.id),
      })

      return {
        items: processedItems,
        nextCursor,
      }
    }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session
    const readCount = await ctx.prisma.readPosts.count({
      where: {
        userId: user.id,
        post: {
          parentPostId: null,
        },
      },
    })
    const allVisiblePostsCount = await ctx.prisma.post.count({
      where: {
        parentPostId: null,
      },
    })
    return {
      unreadCount: allVisiblePostsCount - readCount,
      totalCount: allVisiblePostsCount,
    }
  }),
  byId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input
      const post = await ctx.prisma.post.findFirst({
        where: { id, deletedAt: null },
        select: withCommentsPostSelect,
      })
      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${id}'`,
        })
      }

      return processFeedbackItem(post, ctx.session.user.id)
    }),
  add: protectedProcedure
    .input(addPostSchema)
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: {
          ...input,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        select: defaultPostSelect,
      })
      return post
    }),
  edit: protectedProcedure
    .input(editPostSchema)
    .mutation(async ({ input: { id, ...data }, ctx }) => {
      const postToEdit = await ctx.prisma.post.findUnique({
        where: { id },
        select: defaultPostSelect,
      })
      const isUserOwner = postToEdit?.authorId === ctx.session.user.id
      if (!isUserOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `No post with id '${id}'`,
        })
      }

      const updatedPost = await ctx.prisma.post.update({
        where: { id },
        data,
        select: defaultPostSelect,
      })
      return updatedPost
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const postToDelete = await ctx.prisma.post.findUnique({
        where: { id },
        select: defaultPostSelect,
      })
      if (!postToDelete) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${id}'`,
        })
      }
      if (postToDelete?.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      const post = await ctx.prisma.post.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      })

      return post
    }),
  setRead: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      const readPost = await ctx.prisma.readPosts.upsert({
        where: {
          postId_userId: {
            userId: ctx.session.user.id,
            postId: id,
          },
        },
        update: {},
        create: {
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          post: {
            connect: {
              id,
            },
          },
        },
      })
      return readPost
    }),
})
