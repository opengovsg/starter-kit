import type { TRPCQueryOptions } from '@trpc/tanstack-react-query'
import { cache } from 'react'
import { headers } from 'next/headers'
import { forbidden, notFound, redirect } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import type { AppRouter } from '~/server/api/root'
import { LOGIN_ROUTE } from '~/constants'
import { appRouter } from '~/server/api/root'
import { createCallerFactory, createTRPCContext } from '~/server/api/trpc'
import { createQueryClient } from './query-client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set('x-trpc-source', 'rsc')

  return createTRPCContext({
    headers: heads,
  })
})

/**
 * Only use this function if you really need to use the data both on the server as well as inside client components
 * and understand the tradeoffs explained in the [Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#data-ownership-and-revalidation) guide.
 * Always use a try-catch block if you use this function to fetch data on the server component and there are specific errors you want to handle.
 */
export const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: createContext,
  queryClient: getQueryClient,
})

const callerFactory = createCallerFactory(appRouter)
/**
 */

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
    onError: ({ error, ctx }) => {
      switch (error.code) {
        case 'NOT_FOUND':
          return notFound()
        case 'UNAUTHORIZED':
          ctx?.session.destroy()
          return redirect(LOGIN_ROUTE)
        case 'FORBIDDEN':
          return forbidden()
        default:
          console.error('>>> tRPC Error in RSC caller', error)
      }
    },
  })
}

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  )
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    await queryClient.prefetchInfiniteQuery(queryOptions as any)
  } else {
    await queryClient.prefetchQuery(queryOptions)
  }
}
