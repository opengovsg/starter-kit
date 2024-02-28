import { z } from 'zod'
import { HOME } from '~/lib/routes'
import { isRelativeUrl } from '~/utils/url'

export const callbackUrlSchema = z
  .string()
  .optional()
  .default(HOME)
  .refine((url) => url && isRelativeUrl(url))
  .catch(HOME)
