import { z } from 'zod'

// Coerces a string to true if it's "true", false if "false".
const coerceBoolean = z
  .string()
  // only allow "true" or "false" or empty string
  .refine((s) => s === 'true' || s === 'false' || s === '')
  // transform to boolean
  .transform((s) => s === 'true')
  // make sure tranform worked
  .pipe(z.boolean())

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_ENABLE_STORAGE: coerceBoolean.default('false'),
  NEXT_PUBLIC_ENABLE_SGID: coerceBoolean.default('false'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Starter Kit'),
})

/** Feature flags */
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
    // Add required keys if flag is enabled.
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_PUBLIC_HOSTNAME: z.string().min(1),
  }),
  baseR2Schema.extend({
    NEXT_PUBLIC_ENABLE_STORAGE: z.literal(false),
  }),
])

const baseSgidSchema = z.object({
  SGID_CLIENT_ID: z.string().optional(),
  SGID_CLIENT_SECRET: z.string().optional(),
  // Remember to set SGID redirect URI in SGID dev portal.
  SGID_REDIRECT_URI: z.union([z.string().url(), z.string()]).optional(),
  SGID_PRIVATE_KEY: z.string().optional(),
})

const sgidServerSchema = z.discriminatedUnion('NEXT_PUBLIC_ENABLE_SGID', [
  baseSgidSchema.extend({
    NEXT_PUBLIC_ENABLE_SGID: z.literal(true),
    // Add required keys if flag is enabled.
    SGID_CLIENT_ID: z.string().min(1),
    SGID_CLIENT_SECRET: z.string().min(1),
    SGID_PRIVATE_KEY: z.string().min(1),
    SGID_REDIRECT_URI: z.string().url(),
  }),
  baseSgidSchema.extend({
    NEXT_PUBLIC_ENABLE_SGID: z.literal(false),
  }),
])

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z
  .object({
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    OTP_EXPIRY: z.coerce.number().positive().optional().default(600),
    POSTMAN_API_KEY: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM_ADDRESS: z.string().email().optional(),
    SESSION_SECRET: z.string().min(32),
  })
  // Add on schemas as needed that requires conditional validation.
  .merge(baseR2Schema)
  .merge(baseSgidSchema)
  .merge(client)
  // Add on refinements as needed for conditional environment variables
  // .superRefine((val, ctx) => ...)
  .superRefine((val, ctx) => {
    const parse = r2ServerSchema.safeParse(val)
    if (!parse.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_ENABLE_STORAGE'],
        message: 'R2 environment variables are missing',
      })
      parse.error.issues.forEach((issue) => {
        ctx.addIssue(issue)
      })
    }
  })
  .superRefine((val, ctx) => {
    const parse = sgidServerSchema.safeParse(val)
    if (!parse.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_ENABLE_SGID'],
        message: 'SGID environment variables are missing',
      })
      parse.error.issues.forEach((issue) => {
        ctx.addIssue(issue)
      })
    }
  })
  .refine((val) => !(val.SENDGRID_API_KEY && !val.SENDGRID_FROM_ADDRESS), {
    message: 'SENDGRID_FROM_ADDRESS is required when SENDGRID_API_KEY is set',
    path: ['SENDGRID_FROM_ADDRESS'],
  })

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 * Intellisense should work due to inference.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  // Server-side env vars
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  OTP_EXPIRY: process.env.OTP_EXPIRY,
  POSTMAN_API_KEY: process.env.POSTMAN_API_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_ADDRESS: process.env.SENDGRID_FROM_ADDRESS,
  SESSION_SECRET: process.env.SESSION_SECRET,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_AVATARS_BUCKET_NAME: process.env.R2_AVATARS_BUCKET_NAME,
  R2_PUBLIC_HOSTNAME: process.env.R2_PUBLIC_HOSTNAME,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  SGID_CLIENT_ID: process.env.SGID_CLIENT_ID,
  SGID_CLIENT_SECRET: process.env.SGID_CLIENT_SECRET,
  SGID_PRIVATE_KEY: process.env.SGID_PRIVATE_KEY,
  SGID_REDIRECT_URI: process.env.SGID_REDIRECT_URI,
  // Client-side env vars
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_ENABLE_STORAGE: process.env.NEXT_PUBLIC_ENABLE_STORAGE,
  NEXT_PUBLIC_ENABLE_SGID: process.env.NEXT_PUBLIC_ENABLE_SGID,
}

// Don't touch the part below
// --------------------------
/** @typedef {z.input<typeof server>} MergedInput */
/** @typedef {z.infer<typeof server>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

// @ts-expect-error Types are wonky from refinement
let env = /** @type {MergedOutput} */ (process.env)

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === 'undefined'

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? server.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  )

  if (parsed.success === false) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    )
    throw new Error('Invalid environment variables')
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith('NEXT_PUBLIC_'))
        throw new Error(
          process.env.NODE_ENV === 'production'
            ? '❌ Attempted to access a server-side environment variable on the client'
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        )
      return target[/** @type {keyof typeof target} */ (prop)]
    },
  })
}

export { env }
