import { createUrlSchema } from '@opengovsg/starter-kitty-validators/url'
import { z } from 'zod'

import { getBaseUrl } from '~/utils/getBaseUrl'
import { zodEnumFromObjKeys } from '~/utils/zod'
import { AllRoutes, HOME } from '~/lib/routes'

const baseUrl = new URL(getBaseUrl())

const urlSchema = createUrlSchema({
  baseOrigin: baseUrl.origin,
  whitelist: {
    protocols: ['http', 'https'],
    hosts: [baseUrl.host],
  },
})

/**
 * Zod schema for validating internal (same-app) URLs
 */
export const appUrlSchema = z
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

/**
 * Zod schema for validating routeKeys
 */
export const routeKeySchema = zodEnumFromObjKeys(AllRoutes)
  .optional()
  .default('HOME')
