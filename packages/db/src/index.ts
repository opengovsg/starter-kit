import { PrismaPg } from '@prisma/adapter-pg'

import { env } from './env'
import { kyselyPrismaExtension } from './extensions'
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrisma>
}

const createPrisma = () => {
  const pool = new PrismaPg({ connectionString: env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: pool }).$extends(
    kyselyPrismaExtension,
  )

  return prisma
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const db = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// This export is needed to avoid the TypeScript error:
// The inferred type of 'prisma' cannot be named without a reference to '../node_modules/@repo/database/src/generated/prisma'.
// This is likely not portable. A type annotation is necessary.ts(2742)
export type { Prisma, PrismaClient } from './generated/prisma/client'
