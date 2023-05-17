import { z } from 'zod'

export const updateMeSchema = z.object({
  name: z.string().nonempty({
    message: 'Name is required',
  }),
  username: z.string().nonempty({
    message: 'Username is required',
  }),
  bio: z.string().optional(),
  image: z.string().optional(),
})
