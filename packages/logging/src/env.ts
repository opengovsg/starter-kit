import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_ENV: z
      .enum(['development', 'staging', 'production', 'test', 'vapt'])
      .default('development'),
    NEXT_PUBLIC_APP_VERSION: z.string().default('0.0.0'),
  },
  clientPrefix: 'NEXT_PUBLIC_',
  runtimeEnv: process.env,
  server: {
    LOG_LEVEL: z
      .enum(['silent', 'debug', 'info', 'notice', 'warn', 'error'])
      .default('info'),
  },
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },
  skipValidation:
    (process.env.SKIP_ENV_VALIDATION ?? '') !== '' ||
    process.env.npm_lifecycle_event === 'lint',
})
