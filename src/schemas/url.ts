import { createUrlSchema } from '@opengovsg/starter-kitty-validators/url'
import { z } from 'zod'

import { getBaseUrl } from '~/utils/getBaseUrl'
import { HOME } from '~/lib/routes'

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
