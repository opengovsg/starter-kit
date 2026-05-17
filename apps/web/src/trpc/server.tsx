import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { createContext } from './context'
import { createQueryClient } from './query-client'

import { appRouter } from '~/server/api/root'
import { createCallerFactory } from '~/server/api/trpc'

export { createQueryClient }

/**
 * Create a server-side tRPC caller that can be used in route loaders.
 * Data returned from loaders can be passed to client components or used
 * to seed the React Query cache via HydrationBoundary.
 */
export function createServerCaller() {
  return createCallerFactory(appRouter)
}

export async function createContextualCaller() {
  const ctx = await createContext()
  return createCallerFactory(appRouter)(ctx)
}

export { HydrationBoundary }

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = createQueryClient()
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  )
}
