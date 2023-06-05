import { type Prisma } from '@prisma/client'
import { type withCommentsPostSelect } from './post.select'

// Infer the resulting payload type
type MyPostPayload = Prisma.PostGetPayload<{
  select: typeof withCommentsPostSelect
}>

export const processFeedbackItem = <T extends MyPostPayload>(
  { authorId, readBy, ...item }: T,
  sessionUserId: string
) => {
  return {
    ...item,
    read: readBy.some((read) => read.user.id === sessionUserId),
    canEdit: authorId === sessionUserId,
  }
}
