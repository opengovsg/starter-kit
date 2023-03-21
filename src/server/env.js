// @ts-check
/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 * It has to be a `.js`-file to be imported there.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const { z } = require('zod');

/*eslint sort-keys: "error"*/
const envSchema = z.object({
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  OTP_EXPIRY: z.coerce.number().positive().optional().default(600),
  OTP_HASH_SECRET: z.string().min(16),
  POSTMAN_API_KEY: z.string(),
  SESSION_SECRET: z.string().min(32),
  SGID_CLIENT_ID: z.string(),
  SGID_CLIENT_SECRET: z.string(),
  SGID_PRIVATE_KEY: z.string(),
  SHADOW_DATABASE_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(env.error.format(), null, 4),
  );
  process.exit(1);
}
module.exports.env = env.data;
