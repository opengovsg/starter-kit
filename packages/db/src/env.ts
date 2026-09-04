import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    DATABASE_URL: z.string(),
  },
  skipValidation:
    (process.env.SKIP_ENV_VALIDATION ?? '') !== '' ||
    process.env.npm_lifecycle_event === 'lint',
})
