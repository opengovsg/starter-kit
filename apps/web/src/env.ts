import { createEnv } from '@t3-oss/env-core'
import { vercel } from '@t3-oss/env-core/presets-zod'
import z from 'zod'

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    PORT: z.coerce.number().default(3000),
    OTP_EXPIRY: z.coerce.number().positive().optional().default(600), // OTP expiry time in seconds
    DATABASE_URL: z.url(),
    POSTMAN_API_KEY: z.string().optional(),
    SESSION_SECRET: z.string().min(32),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `VITE_`.
   */
  client: {
    VITE_APP_NAME: z.string().default('Starter Kit'),
    VITE_APP_URL: z.url().optional(),
    VITE_APP_VERSION: z.string().default('0.0.0'),
    VITE_APP_ENV: z
      .enum(['uat', 'staging', 'vapt', 'development', 'production'])
      .default('development'),
    // VITE_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    OTP_EXPIRY: process.env.OTP_EXPIRY,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTMAN_API_KEY: process.env.POSTMAN_API_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET,
    VITE_APP_VERSION: process.env.VITE_APP_VERSION,
    VITE_APP_ENV: process.env.VITE_APP_ENV,
    VITE_APP_NAME: process.env.VITE_APP_NAME,
    VITE_APP_URL: process.env.VITE_APP_URL,
    // VITE_CLIENTVAR: process.env.VITE_CLIENTVAR,
  },
  clientPrefix: 'VITE_',
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === 'lint',
})
