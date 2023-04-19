import { Prisma } from '@prisma/client'

export const defaultReplySelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  content: true,
  contentHtml: true,
  createdAt: true,
  authorId: true,
  author: {
    select: {
      image: true,
      name: true,
    },
  },
})
