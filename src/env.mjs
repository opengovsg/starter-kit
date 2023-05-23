import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const coerceBoolean = z
  .string()
  // only allow "true" or "false"
  .refine((s) => s === 'true' || s === 'false')
  // transform to boolean
  .transform((s) => s === 'true')
  // make sure tranform worked
  .pipe(z.boolean())

export const env = createEnv({
  skipValidation: process.env.NODE_ENV === 'test',
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    OTP_EXPIRY: z.coerce.number().positive().optional().default(600),
    POSTMAN_API_KEY: z.string().optional(),
    SESSION_SECRET: z.string().min(32),
  },
  client: {
    NEXT_PUBLIC_ENABLE_STORAGE: coerceBoolean.default('false'),
    NEXT_PUBLIC_APP_NAME: z.string().default('Starter Kit'),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    OTP_EXPIRY: process.env.OTP_EXPIRY,
    POSTMAN_API_KEY: process.env.POSTMAN_API_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NEXT_PUBLIC_ENABLE_STORAGE: process.env.NEXT_PUBLIC_ENABLE_STORAGE,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
})
