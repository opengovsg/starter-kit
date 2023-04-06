import { Prisma } from '@prisma/client'
import { keyBy } from 'lodash'
import { withCommentsPostSelect } from './post.select'

// Infer the resulting payload type
type MyPostPayload = Prisma.PostGetPayload<{
  select: typeof withCommentsPostSelect
}>

export const processFeedbackItem = <T extends MyPostPayload>(
  { authorId, ...item }: T,
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
    readBy: keyBy(item.readBy, 'user.id'),
  }
}
