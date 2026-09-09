import { toast } from '@opengovsg/oui/toast'
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { isTRPCClientError } from '@trpc/client'
import { deserialize, serialize } from 'superjson'

import { SIGN_OUT_API_ROUTE } from '~/constants'
import { trpcHandleableErrorCodeSchema } from '~/validators/trpc'

const handleTRPCError = (error: Error): boolean => {
  if (!isTRPCClientError(error)) {
    return false
  }
  const result = trpcHandleableErrorCodeSchema.safeParse(error)
  if (!result.success) {
    return false
  }

  const { code } = result.data.data
  if (code === 'UNAUTHORIZED') {
    window.location.href = SIGN_OUT_API_ROUTE
    return true
  }
  return false
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      dehydrate: {
        serializeData: serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () =>
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          false,
      },
      hydrate: {
        deserializeData: deserialize,
      },
      mutations: {
        onError: (error) => {
          // UNAUTHORIZED is already handled by mutationCache.onError
          if (handleTRPCError(error)) {
            return
          }
          // Log the error to an error reporting service
          console.error('>>> Error in mutation', error)
          if (isTRPCClientError(error)) {
            const result = trpcHandleableErrorCodeSchema.safeParse(error)
            if (result.success) {
              const { code } = result.data.data
              if (code === 'FORBIDDEN') {
                toast.error('You are not allowed to perform this action.')
                return
              }

              toast.error('The requested resource was not found.')
              return
            }
          }
          // Default toast
          toast.error('An unexpected error occurred. Please try again later.')
        },
        retry: false,
      },
      queries: {
        retry: false,
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        handleTRPCError(error)
      },
    }),
    queryCache: new QueryCache({
      onError: (error) => {
        handleTRPCError(error)
      },
    }),
  })
