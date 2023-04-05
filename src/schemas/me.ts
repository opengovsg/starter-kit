import { z } from 'zod'

export const updateMeSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
})
