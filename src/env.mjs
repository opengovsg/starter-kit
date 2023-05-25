import { z } from 'zod'
import { browserEnvSchema } from './browserEnv.mjs'

const baseR2Schema = z.object({
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_PUBLIC_HOSTNAME: z.string().optional(),
  R2_AVATARS_BUCKET_NAME: z.string().optional(),
})

const r2ServerSchema = z.discriminatedUnion('NEXT_PUBLIC_ENABLE_STORAGE', [
  baseR2Schema.extend({
    NEXT_PUBLIC_ENABLE_STORAGE: z.literal(true),
    // Add required keys
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_PUBLIC_HOSTNAME: z.string().min(1),
  }),
  baseR2Schema.extend({
    NEXT_PUBLIC_ENABLE_STORAGE: z.literal(false),
  }),
])

const serverEnvSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    OTP_EXPIRY: z.coerce.number().positive().optional().default(600),
    POSTMAN_API_KEY: z.string().optional(),
    SESSION_SECRET: z.string().min(32),
  })
  .merge(baseR2Schema)
  .merge(browserEnvSchema)
  .refine((val) => r2ServerSchema.safeParse(val).success, {
    message: 'R2 environment variables are missing',
    path: ['NEXT_PUBLIC_ENABLE_STORAGE'],
  })

const parsedEnv = serverEnvSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 4)
  )
  process.exit(1)
}

export const env = parsedEnv.data
