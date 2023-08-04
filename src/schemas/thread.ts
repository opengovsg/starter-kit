import { z } from 'zod'
import { addPostSchema } from './post'

export const addReplySchema = addPostSchema.extend({
  postId: z.string(),
})

export type AddReplySchema = z.infer<typeof addReplySchema>
