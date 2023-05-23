import { z } from 'zod'
import { ACCEPTED_FILE_TYPES } from '~/utils/image'

export const presignImageInputSchema = z.object({
  fileContentType: z.enum(ACCEPTED_FILE_TYPES),
})
export const presignImageOutputSchema = z
  .object({
    url: z.string(),
    key: z.string(),
  })
  .or(z.null())
