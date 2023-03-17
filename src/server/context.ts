import * as trpc from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/lib/auth';
import { prisma } from './prisma';

interface CreateContextOptions {
  session: Session | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextOptions) {
  return {
    session: opts.session,
    prisma,
  };
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerSession(req, res, authOptions);
  return await createContextInner({
    session,
  });
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
