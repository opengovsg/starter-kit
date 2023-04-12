import { Prisma } from '@prisma/client'

export const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
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
  readBy: {
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
})

export const withCommentsPostSelect = Prisma.validator<Prisma.PostSelect>()({
  ...defaultPostSelect,
  comments: {
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      content: true,
      contentHtml: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
})
