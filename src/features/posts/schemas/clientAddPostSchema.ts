import { z } from 'zod'
import { addPostSchema } from '~/schemas/post'

export const clientAddPostSchema = addPostSchema.extend({
  images:
    typeof window === 'undefined' ? z.undefined() : z.array(z.instanceof(File)),
})

export type ClientAddPostSchema = z.infer<typeof clientAddPostSchema>
