import { PrismaPg } from '@prisma/adapter-pg'

import { env } from './env'
import { kyselyPrismaExtension } from './extensions'
import { PrismaClient } from './generated/prisma/client'

declare global {
  var prisma: ReturnType<typeof createPrisma> | undefined
}

const createPrisma = () => {
  const pool = new PrismaPg({ connectionString: env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: pool }).$extends(
    kyselyPrismaExtension
  )

  return prisma
}

export const db = globalThis.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// This export is needed to avoid the TypeScript error:
// The inferred type of 'prisma' cannot be named without a reference to '../node_modules/@repo/database/src/generated/prisma'.
// This is likely not portable. A type annotation is necessary.ts(2742)
export type { Prisma, PrismaClient } from './generated/prisma/client'
