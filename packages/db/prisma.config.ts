import { defineConfig } from 'prisma/config'

export default defineConfig({
  migrations: {
    seed: 'pnpm dlx tsx prisma/seed.ts',
  },
})
