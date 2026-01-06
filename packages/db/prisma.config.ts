import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  migrations: {
    seed: 'pnpm dlx tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
  schema: 'prisma/schema.prisma',
})
