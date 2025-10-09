import z from 'zod'

import { govEmailSchema } from './email'

export const emailSignInSchema = z.object({
  email: govEmailSchema,
})
