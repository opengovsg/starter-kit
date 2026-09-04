import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-nextjs/presets-zod'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_ENV: z
      .enum(['uat', 'staging', 'vapt', 'development', 'production'])
      .default('development'),
    NEXT_PUBLIC_APP_NAME: z.string().default('Starter Kit'),
    NEXT_PUBLIC_APP_URL: z.url().optional(),
    NEXT_PUBLIC_APP_VERSION: z.string().default('0.0.0'),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  extends: [vercel()],
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.url(),
    // OTP expiry time in seconds
    OTP_EXPIRY: z.coerce.number().positive().optional().default(600),
    PORT: z.coerce.number().default(3000),
    POSTMAN_API_KEY: z.string().optional(),
    SESSION_SECRET: z.string().min(32),
  },
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },
  skipValidation:
    process.env.SKIP_ENV_VALIDATION !== undefined ||
    process.env.npm_lifecycle_event === 'lint',
})
