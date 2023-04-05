import { Prisma } from '@prisma/client'

export const defaultCommentSelect = Prisma.validator<Prisma.CommentSelect>()({
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
