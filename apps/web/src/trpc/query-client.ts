import { toast } from '@opengovsg/oui/toast'
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { isTRPCClientError } from '@trpc/client'
import SuperJSON from 'superjson'

import { LOGIN_ROUTE } from '~/constants'
import { trpcHandleableErrorCodeSchema } from '~/validators/trpc'

export const createQueryClient = () =>
  new QueryClient({
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
          // TODO: Log the error to an error reporting service
          console.error('>>> Error in mutation', error)
          if (isTRPCClientError(error)) {
            const result = trpcHandleableErrorCodeSchema.safeParse(error)
            if (result.success) {
              const code = result.data.data.code
              if (code === 'FORBIDDEN') {
                return toast.error(
                  'You are not allowed to perform this action.',
                )
              }

              if (code === 'UNAUTHORIZED') {
                window.location.href = LOGIN_ROUTE
                return
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
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false
        },
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  })
