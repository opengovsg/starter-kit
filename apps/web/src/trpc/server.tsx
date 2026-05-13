import { cache } from 'react'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { TRPCQueryOptions } from '@trpc/tanstack-react-query'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import { createContext } from './context'
import { createQueryClient } from './query-client'

import type { AppRouter } from '~/server/api/root'
import { appRouter } from '~/server/api/root'

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
  queryOptions: T
) {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    await queryClient.prefetchInfiniteQuery(queryOptions as any)
  } else {
    await queryClient.prefetchQuery(queryOptions)
  }
}
