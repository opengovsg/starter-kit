import { z } from 'zod'

export const addReplySchema = z.object({
  content: z.string().min(1),
  contentHtml: z.string().min(1),
  postId: z.string(),
})
