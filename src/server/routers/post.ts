/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { router, protectedProcedure } from '../trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { addPostSchema } from '../schemas/post';
import { keyBy } from 'lodash';

/**
 * Default selector for Post.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  content: true,
  contentHtml: true,
  createdAt: true,
  updatedAt: true,
  anonymous: true,
  authorId: true,
  author: {
    select: {
      image: true,
      name: true,
    },
  },
});

export const postRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await prisma.post.findMany({
        select: {
          ...defaultPostSelect,
          readBy: {
            orderBy: {
              updatedAt: 'asc',
            },
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      const processedItems = items
        .map(({ authorId, ...item }) => {
          if (item.anonymous) {
            item.author.name = 'Anonymous';
            item.author.image = null;
            if (authorId === ctx.session.user.id) {
              item.author.name += ' (you)';
            }
          }
          return {
            ...item,
            readBy: keyBy(item.readBy, 'user.id'),
          };
        })
        .reverse();

      return {
        items: processedItems,
        nextCursor,
      };
    }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session;
    const readCount = await prisma.readPosts.count({
      where: {
        userId: user.id,
      },
    });
    const allVisiblePostsCount = await prisma.post.count({
      where: {
        hidden: false,
      },
    });
    return {
      unreadCount: allVisiblePostsCount - readCount,
      totalCount: allVisiblePostsCount,
    };
  }),
  byId: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const post = await prisma.post.findUnique({
        where: { id },
        select: defaultPostSelect,
      });
      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${id}'`,
        });
      }
      if (post.anonymous) {
        post.author.name = null;
      }
      return post;
    }),
  add: protectedProcedure
    .input(addPostSchema)
    .mutation(async ({ input, ctx }) => {
      const post = await prisma.post.create({
        data: {
          ...input,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        select: defaultPostSelect,
      });
      return post;
    }),
});
