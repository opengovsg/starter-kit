import { z } from 'zod';

export const addPostSchema = z.object({
  title: z.string().min(1).max(32).optional(),
  contentHtml: z.string().min(1),
});
