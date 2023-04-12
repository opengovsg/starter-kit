import * as trpc from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getIronSession, IronSession } from 'iron-session'
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

interface MyCreateNextContextOptions
  extends Partial<CreateNextContextOptions>,
    CreateContextOptions {}
/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts?: MyCreateNextContextOptions) => {
  const session =
    opts?.session ??
    (opts?.req && opts.res
      ? await getIronSession(opts.req, opts.res, sessionOptions)
      : undefined)
  const contextInner = await createContextInner({
    session,
  })

  return {
    ...contextInner,
    req: opts?.req,
    res: opts?.res,
  }
}

export type Context = trpc.inferAsyncReturnType<typeof createContextInner>
