import { createUrlSchema } from '@opengovsg/starter-kitty-validators/url'
import { z } from 'zod'

import { getBaseUrl } from '~/utils/getBaseUrl'
import { HOME } from '~/lib/routes'

const baseUrl = new URL(getBaseUrl())

const urlSchema = createUrlSchema({
  baseOrigin: baseUrl.origin,
  whitelist: {
    protocols: ['http', 'https'],
    hosts: [baseUrl.host],
  },
})

export const callbackUrlSchema = z
  .string()
  .optional()
  .default(HOME)
  .transform((val, ctx) => {
    try {
      return urlSchema.parse(val)
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL validation error',
      })
      return z.NEVER
    }
  })
  .catch(new URL(HOME, baseUrl.origin))
