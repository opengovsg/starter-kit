import type * as trpc from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getIronSession } from 'iron-session'
import { prisma } from './prisma'
import { sessionOptions } from './modules/auth/session'
import { type SessionData, type Session } from '~/lib/types/session'

interface CreateContextOptions {
  session?: Session
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextOptions) {
  return {
    session: opts.session,
    prisma,
  }
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await getIronSession<SessionData>(
    opts.req,
    opts.res,
    sessionOptions
  )

  const innerContext = await createContextInner({
    session,
  })

  return {
    ...innerContext,
    req: opts.req,
  }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
