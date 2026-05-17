import { toast } from '@opengovsg/oui/toast'
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { isTRPCClientError } from '@trpc/client'
import SuperJSON from 'superjson'

import { SIGN_OUT_API_ROUTE } from '~/constants'
import { trpcHandleableErrorCodeSchema } from '~/validators/trpc'

function handleTRPCError(error: Error): boolean {
  if (!isTRPCClientError(error)) return false
  const result = trpcHandleableErrorCodeSchema.safeParse(error)
  if (!result.success) return false

  const code = result.data.data.code
  if (code === 'UNAUTHORIZED') {
    window.location.href = SIGN_OUT_API_ROUTE
    return true
  }
  return false
}

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        handleTRPCError(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        handleTRPCError(error)
      },
    }),
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        retry: false,
      },
      mutations: {
        retry: false,
        onError: (error) => {
          // UNAUTHORIZED is already handled by mutationCache.onError
          if (handleTRPCError(error)) return
          // TODO: Log the error to an error reporting service
          console.error('>>> Error in mutation', error)
          if (isTRPCClientError(error)) {
            const result = trpcHandleableErrorCodeSchema.safeParse(error)
            if (result.success) {
              const code = result.data.data.code
              if (code === 'FORBIDDEN') {
                return toast.error(
                  'You are not allowed to perform this action.'
                )
              }

              return toast.error('The requested resource was not found.')
            }
          }
          // Default toast
          toast.error('An unexpected error occurred. Please try again later.')
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => false,
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  })
