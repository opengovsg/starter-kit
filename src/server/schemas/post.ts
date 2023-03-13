import { z } from 'zod';

export const addPostSchema = z.object({
  title: z.string().min(1).max(32).optional(),
  content: z.string().min(1),
  contentHtml: z.string().min(1),
  anonymous: z.boolean().optional(),
});
