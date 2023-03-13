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
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
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
