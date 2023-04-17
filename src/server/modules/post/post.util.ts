import { Prisma } from '@prisma/client'
import { withCommentsPostSelect } from './post.select'

// Infer the resulting payload type
type MyPostPayload = Prisma.PostGetPayload<{
  select: typeof withCommentsPostSelect
}>

export const processFeedbackItem = <T extends MyPostPayload>(
  { authorId, readBy, ...item }: T,
  sessionUserId: string
) => {
  if (item.anonymous) {
    item.author.name = 'Anonymous'
    item.author.image = null
    if (authorId === sessionUserId) {
      item.author.name += ' (you)'
    }
  }
  return {
    ...item,
    read: readBy.some((read) => read.user.id === sessionUserId),
    canEdit: authorId === sessionUserId,
  }
}
