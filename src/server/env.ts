import { z } from 'zod'
import { browserEnvSchema } from '~/browserEnv'

const withR2Schema = z.object({
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_AVATARS_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_HOSTNAME: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
})

const serverEnvSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    OTP_EXPIRY: z.coerce.number().positive().optional().default(600),
    POSTMAN_API_KEY: z.string().optional(),
    SESSION_SECRET: z.string().min(32),
  })
  .merge(browserEnvSchema.merge(withR2Schema))
  .refine(
    (val) => {
      if (val.NEXT_PUBLIC_ENABLE_STORAGE) {
        return (
          !!val.R2_ACCESS_KEY_ID &&
          !!val.R2_ACCOUNT_ID &&
          !!val.R2_SECRET_ACCESS_KEY &&
          !!val.R2_AVATARS_BUCKET_NAME &&
          !!val.R2_PUBLIC_HOSTNAME
        )
      }
      return true
    },
    {
      message: 'R2 environment variables are missing',
      path: ['NEXT_PUBLIC_ENABLE_STORAGE'],
    }
  )

const parsedEnv = serverEnvSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 4)
  )
  process.exit(1)
}

export const env = parsedEnv.data
