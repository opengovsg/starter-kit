import { z } from 'zod'

// Coerces a string to true if it's "true" or "1", false if "false" or "0"
export const coerceBoolean = z
  .enum(['0', '1', 'true', 'false', 'TRUE', 'FALSE'])
  .catch('false')
  .transform((value) => value.toLowerCase() === 'true' || value === '1')

const browserEnvSchema = z.object({
  NEXT_PUBLIC_ENABLE_STORAGE: coerceBoolean.default('false'),
})

const parsedEnv = browserEnvSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 4)
  )
  process.exit(1)
}

export const browserEnv = parsedEnv.data
