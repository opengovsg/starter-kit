import { z } from 'zod'
import { HOME } from '~/lib/routes'
import { createUrlSchema } from '@opengovsg/starter-kitty-validators/url'
import { getBaseUrl } from '~/utils/getBaseUrl'

const baseUrl = new URL(getBaseUrl())

export const callbackUrlSchema = z
  .string()
  .optional()
  .default(HOME)
  .pipe(
    createUrlSchema({
      baseOrigin: baseUrl.origin,
      whitelist: {
        protocols: ['http', 'https'],
        hosts: [baseUrl.host],
      },
    }),
  )
  .catch(new URL(HOME, baseUrl.origin))
