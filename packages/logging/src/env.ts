import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },
  client: {
    VITE_APP_ENV: z
      .enum(['development', 'staging', 'production', 'test', 'vapt'])
      .default('development'),
    VITE_APP_VERSION: z.string().default('0.0.0'),
  },
  clientPrefix: 'VITE_',
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    LOG_LEVEL: z
      .enum([
        'silent',
        'debug',
        'info',
        'notice',
        'warning',
        'error',
        'critical',
        'alert',
        'emergency',
      ])
      .default('info'),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: process.env,
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === 'lint',
})
