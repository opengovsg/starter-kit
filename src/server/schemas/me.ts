import { z } from 'zod';

export const updateMeSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
});
