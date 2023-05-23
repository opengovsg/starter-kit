import { z } from 'zod'

export const presignImageInputSchema = z.object({
  fileContentType: z.string().startsWith('image/'),
})
export const presignImageOutputSchema = z
  .object({
    url: z.string(),
    key: z.string(),
  })
  .or(z.null())
