import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod/v4'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation:
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
