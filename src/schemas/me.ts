import { z } from 'zod'

export const updateMeSchema = z.object({
  email: z.string().email().optional(),
  name: z.string(),
  bio: z.string().max(200).optional(),
  image: z.string().optional(),
})
