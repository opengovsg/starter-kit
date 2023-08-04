import { z } from 'zod'

export const addPostSchema = z.object({
  title: z.string().min(1).max(32).optional(),
  content: z.string().min(1),
  contentHtml: z.string().min(1),
  imageKeys: z.array(z.string()).optional(),
})

export type AddPostSchema = z.infer<typeof addPostSchema>

export const byUserSchema = z.object({
  limit: z.number().min(1).max(100).nullish(),
  cursor: z.string().nullish(),
  username: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const listPostsInputSchema = z.object({
  limit: z.number().min(1).max(100).nullish(),
  cursor: z.string().nullish(),
  order: z.enum(['asc', 'desc']).default('desc'),
})
