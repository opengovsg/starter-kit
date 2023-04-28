import { z } from 'zod'

// Coerces a string to true if it's "true" or "1", false if "false" or "0"
export const coerceBoolean = z
  .enum(['0', '1', 'true', 'false', 'TRUE', 'FALSE'])
  .catch('false')
  .transform((value) => value.toLowerCase() === 'true' || value === '1')

export const browserEnvSchema = z.object({
  NEXT_PUBLIC_ENABLE_STORAGE: coerceBoolean.default('false'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Starter Kit'),
})

type BrowserEnv = {
  [k in keyof z.infer<typeof browserEnvSchema>]: string | undefined
}

// Must add public env variables here explicitly so NextJS knows to expose them.
const _browserEnv: BrowserEnv = {
  NEXT_PUBLIC_ENABLE_STORAGE: process.env.NEXT_PUBLIC_ENABLE_STORAGE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
}

const parsedEnv = browserEnvSchema.safeParse(_browserEnv)

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 4)
  )
  process.exit(1)
}

/**
 * Validate client-side env are exposed to the client
 */
for (const key of Object.keys(parsedEnv.data)) {
  if (!key.startsWith('NEXT_PUBLIC_')) {
    console.warn('❌ Invalid public environment variable name:\n', key)
    process.exit(1)
  }
}

export const browserEnv = parsedEnv.data
