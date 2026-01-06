import { defineConfig } from 'prisma/config'

export default defineConfig({
  migrations: {
    seed: 'pnpm dlx tsx prisma/seed.ts',
  },
  datasource: {
    // Not using `env` from 'prisma/config' to prevent errors thrown when
    // DATABASE_URL is not set (e.g. prisma generate).
    // See https://github.com/prisma/prisma/issues/28590
    url: process.env.DATABASE_URL,
  },
  schema: 'prisma/schema.prisma',
})
