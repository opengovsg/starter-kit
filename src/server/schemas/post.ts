import { z } from 'zod';

export const addPostSchema = z.object({
  title: z.string().min(1).max(32).optional(),
  content: z.string().min(1),
  contentHtml: z.string().min(1),
  anonymous: z.boolean().optional(),
});

export const listPostsInputSchema = z.object({
  limit: z.number().min(1).max(100).nullish(),
  cursor: z.string().nullish(),
  filter: z
    .enum([
      'all',
      'draft',
      'replied',
      'repliedByMe',
      'unreplied',
      'unrepliedByMe',
      'unread',
    ])
    .default('all'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ListPostsInputSchema = z.infer<typeof listPostsInputSchema>;
