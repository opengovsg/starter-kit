import { notFound, redirect } from '@tanstack/react-router'

import { callerFactory } from './caller'
import { createContext } from './context'

import { SIGN_OUT_API_ROUTE } from '~/constants'

/**
 * Create a server-side caller for the tRPC API.
 * Note that this method is detached from your query client and does not store the data in the cache.
 * This means that you cannot use the data in a server component and expect it to be available in the client.
 * If you want to pass data to the client, return it from a route loader instead.
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
          throw notFound()
        case 'UNAUTHORIZED':
          throw redirect({ to: SIGN_OUT_API_ROUTE })
        case 'FORBIDDEN':
          throw notFound()
        default:
          console.error('>>> tRPC Error in server caller', error)
      }
    },
  })
}
