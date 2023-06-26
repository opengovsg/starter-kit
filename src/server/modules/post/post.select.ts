import { Prisma } from '@prisma/client'

export const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  content: true,
  contentHtml: true,
  images: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: {
      image: true,
      name: true,
      username: true,
    },
  },
  _count: {
    select: {
      replies: true,
      likes: true,
    },
  },
})

export const withCommentsPostSelect = Prisma.validator<Prisma.PostSelect>()({
  ...defaultPostSelect,
  replies: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: defaultPostSelect,
  },
})
