import type * as trpc from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getIronSession, type IronSession } from 'iron-session'
import { sessionOptions } from '~/lib/auth'
import { prisma } from './prisma'

interface CreateContextOptions {
  session?: IronSession
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
  const session = await getIronSession(opts.req, opts.res, sessionOptions)

  return await createContextInner({
    session,
  })
}

export type Context = trpc.inferAsyncReturnType<typeof createContextInner>
