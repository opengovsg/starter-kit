import { z } from 'zod'
import { addPostSchema } from '~/schemas/post'
import { addReplySchema } from '~/schemas/thread'

const clientImageSchema = {
  images:
    typeof window === 'undefined'
      ? z.undefined()
      : z.array(z.instanceof(File)).optional(),
}

export const clientAddPostSchema = addPostSchema
  .omit({
    imageKeys: true,
  })
  .extend(clientImageSchema)

export type ClientAddPostSchema = z.infer<typeof clientAddPostSchema>

export const clientAddReplySchema = addReplySchema
  .omit({
    postId: true,
    imageKeys: true,
  })
  .extend(clientImageSchema)

export type ClientAddReplySchema = z.infer<typeof clientAddReplySchema>
