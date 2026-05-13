import { forbidden, notFound, redirect } from 'next/navigation'

import { callerFactory } from './caller'
import { createContext } from './context'

import { SIGN_OUT_API_ROUTE } from '~/constants'

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
export const createCaller = async (contextFn = createContext) => {
  return callerFactory(await contextFn(), {
    onError: ({ error }) => {
      switch (error.code) {
        case 'NOT_FOUND':
          return notFound()
        case 'UNAUTHORIZED':
          return redirect(SIGN_OUT_API_ROUTE)
        case 'FORBIDDEN':
          return forbidden()
        default:
          console.error('>>> tRPC Error in RSC caller', error)
      }
    },
  })
}
