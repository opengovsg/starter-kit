import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { env } from '~/env.mjs'
import {
  addPostSchema,
  byUserSchema,
  listPostsInputSchema,
} from '~/schemas/post'
import { agnosticProcedure, protectedProcedure, router } from '~/server/trpc'
import { defaultPostSelect, withCommentsPostSelect } from './post.select'

export const postRouter = router({
  likedByUser: agnosticProcedure
    .input(byUserSchema)
    .query(async ({ input, ctx }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */
      const limit = input.limit ?? 50
      const { cursor } = input

      const likedPosts = await ctx.prisma.likedPosts.findMany({
        where: {
          user: {
            username: input.username,
          },
        },
      })
      const posts = await ctx.prisma.post.findMany({
        select: defaultPostSelect,
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
          id: {
            in: likedPosts.map((likedPost) => likedPost.postId),
          },
          deletedAt: null,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (posts.length > limit) {
        // Remove the last item and use it as next cursor

        const nextItem = posts.pop()!
        nextCursor = nextItem.id
      }

      let augmentedPosts: ((typeof posts)[number] & { likedByMe?: boolean })[] =
        posts

      if (ctx.user?.id) {
        // From posts, get whether current user liked each post
        // short circuit if already found before
        const userLikedPosts =
          ctx.user.username === input.username
            ? likedPosts
            : await ctx.prisma.likedPosts.findMany({
                where: {
                  userId: ctx.user.id,
                  postId: {
                    in: posts.map((post) => post.id),
                  },
                },
              })
        const likedUserPosts = Object.fromEntries(
          userLikedPosts.map((likedPost) => [likedPost.postId, true]),
        )
        // Augment posts with whether current user liked each post
        augmentedPosts = posts.map((post) => {
          return {
            ...post,
            likedByMe: likedUserPosts[post.id],
          }
        })
      }

      return {
        posts: augmentedPosts,
        nextCursor,
      }
    }),
  repliesByUser: agnosticProcedure
    .input(byUserSchema)
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor } = input

      const posts = await ctx.prisma.post.findMany({
        select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: input.order,
        },
        where: {
          parentPostId: {
            not: null,
          },
          deletedAt: null,
          author: {
            username: input.username,
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (posts.length > limit) {
        // Remove the last item and use it as next cursor

        const nextItem = posts.pop()!
        nextCursor = nextItem.id
      }

      let augmentedPosts: ((typeof posts)[number] & { likedByMe?: boolean })[] =
        posts

      if (ctx.user?.id) {
        // From posts, get whether current user liked each post
        const userLikedPosts = await ctx.prisma.likedPosts.findMany({
          where: {
            userId: ctx.user.id,
            postId: {
              in: posts.map((post) => post.id),
            },
          },
        })
        const likedUserPosts = Object.fromEntries(
          userLikedPosts.map((likedPost) => [likedPost.postId, true]),
        )
        // Augment posts with whether current user liked each post
        augmentedPosts = posts.map((post) => {
          return {
            ...post,
            likedByMe: likedUserPosts[post.id],
          }
        })
      }

      return {
        posts: augmentedPosts,
        nextCursor,
      }
    }),
  byUser: agnosticProcedure
    .input(byUserSchema)
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor } = input

      const posts = await ctx.prisma.post.findMany({
        select: defaultPostSelect,
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: input.order,
        },
        where: {
          author: {
            username: input.username,
          },
          parentPostId: null,
          deletedAt: null,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (posts.length > limit) {
        // Remove the last item and use it as next cursor
        const nextItem = posts.pop()!
        nextCursor = nextItem.id
      }

      let augmentedPosts: ((typeof posts)[number] & { likedByMe?: boolean })[] =
        posts

      if (ctx.user?.id) {
        // From posts, get whether current user liked each post
        const userLikedPosts = await ctx.prisma.likedPosts.findMany({
          where: {
            userId: ctx.user.id,
            postId: {
              in: posts.map((post) => post.id),
            },
          },
        })
        const likedUserPosts = Object.fromEntries(
          userLikedPosts.map((likedPost) => [likedPost.postId, true]),
        )
        // Augment posts with whether current user liked each post
        augmentedPosts = posts.map((post) => {
          return {
            ...post,
            likedByMe: likedUserPosts[post.id],
          }
        })
      }

      return {
        posts: augmentedPosts,
        nextCursor,
      }
    }),
  toggleLikePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input: { postId }, ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const currentLike = await tx.likedPosts.findFirst({
          where: {
            userId: ctx.user.id,
            postId,
          },
        })
        if (currentLike) {
          await tx.likedPosts.delete({
            where: {
              postId_userId: {
                userId: ctx.user.id,
                postId,
              },
            },
          })
        } else {
          return await tx.likedPosts.create({
            data: {
              user: {
                connect: {
                  id: ctx.user.id,
                },
              },
              post: {
                connect: {
                  id: postId,
                },
              },
            },
          })
        }
      })
    }),
  list: protectedProcedure
    .input(listPostsInputSchema)
    .query(async ({ input, ctx }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 50
      const { cursor } = input

      const items = await ctx.prisma.post.findMany({
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
          parentPostId: null,
          deletedAt: null,
        },
      })
      let nextCursor: typeof cursor | null = null
      if (items.length > limit) {
        // Remove the last item and use it as next cursor
        const nextItem = items.pop()!
        nextCursor = nextItem.id
      }

      return {
        items,
        nextCursor,
      }
    }),
  byId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
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

      let augmentedPost: typeof post & { likedByMe?: boolean } = post

      // From posts, get whether current user liked each post
      const userLikedPosts = await ctx.prisma.likedPosts.findMany({
        where: {
          userId: ctx.user.id,
          postId: {
            in: [post.id, ...post.replies.map((r) => r.id)],
          },
        },
      })
      const likedUserPosts = Object.fromEntries(
        userLikedPosts.map((likedPost) => [likedPost.postId, true]),
      )
      // Augment posts with whether current user liked each post
      const augmentedReplies = post.replies.map((r) => {
        return {
          ...r,
          likedByMe: likedUserPosts[r.id],
        }
      })
      augmentedPost = {
        ...post,
        likedByMe: likedUserPosts[post.id],
        replies: augmentedReplies,
      }

      return augmentedPost
    }),
  add: protectedProcedure
    .input(addPostSchema)
    .mutation(async ({ input: { imageKeys, ...input }, ctx }) => {
      const images = env.NEXT_PUBLIC_ENABLE_STORAGE
        ? imageKeys?.map((key) => `https://${env.R2_PUBLIC_HOSTNAME}/${key}`)
        : []

      const post = await ctx.prisma.post.create({
        data: {
          ...input,
          images,
          author: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
        select: defaultPostSelect,
      })
      return post
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
      if (postToDelete?.authorId !== ctx.user.id) {
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
})
