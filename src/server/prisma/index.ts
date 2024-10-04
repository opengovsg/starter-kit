/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { PrismaClient } from '@prisma/client'
import pino from 'pino'
import { env } from '~/env.mjs'
import { makePgliteClient, applyMigrations } from './pglite'

const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient
}

const choosePrismaClient = () => {
  if (
    !env.DATABASE_URL &&
    (env.NODE_ENV === 'development' || env.NODE_ENV === 'test')
  ) {
    pino().warn({}, 'DATABASE_URL not set, using pglite')
    const { client, prisma: pglitePrismaClient } = makePgliteClient()
    // Inject an env var to appease Prisma
    process.env.DATABASE_URL = 'postgres://using:pglite@localhost:5432/'
    void applyMigrations(client)
    return pglitePrismaClient
  } else {
    return (
      prismaGlobal.prisma ||
      new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    )
  }
}

export const prisma: PrismaClient = choosePrismaClient()

if (env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma
}
