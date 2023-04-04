import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  OTP_EXPIRY: z.coerce.number().positive().optional().default(600),
  POSTMAN_API_KEY: z.string(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_HOSTNAME: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  SESSION_SECRET: z.string().min(32),
  SHADOW_DATABASE_URL: z.string().url(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 4)
  )
  process.exit(1)
}

export const env = parsedEnv.data
