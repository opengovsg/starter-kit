import { forbidden, notFound, redirect } from 'next/navigation'

import { callerFactory } from './caller'
import { createContext } from './context'

import { SIGN_OUT_API_ROUTE } from '~/constants'

const handleCallerError = (error: { code: string }) => {
  if (error.code === 'NOT_FOUND') {
    notFound()
    return
  }
  if (error.code === 'UNAUTHORIZED') {
    redirect(SIGN_OUT_API_ROUTE)
    return
  }
  if (error.code === 'FORBIDDEN') {
    forbidden()
    return
  }
  console.error('>>> tRPC Error in RSC caller', error)
}

/**
 * Create a server-side caller for the tRPC API.
 * Note that this method is detached from your query client and does not store the data in the cache.
 * This means that you cannot use the data in a server component and expect it to be available in the client.
 * If you want to stream the data to the client, use the `prefetch` method in apps/web/src/trpc/server.tsx.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = async (contextFn = createContext) =>
  callerFactory(await contextFn(), {
    onError: ({ error }) => {
      handleCallerError(error)
    },
  })
