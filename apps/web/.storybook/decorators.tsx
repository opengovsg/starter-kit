import type { Decorator } from '@storybook/nextjs-vite'
import { useState } from 'react'
import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { createTRPCClient, httpLink, loggerLink } from '@trpc/client'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SuperJSON from 'superjson'

import type { AppRouter } from '~/server/api/root'
import { TRPCProvider } from '~/trpc/react'

/**
 * This decorator wraps stories with TRPC and React Query and the other app-level providers.
 * It mimics the setup in `apps/web/src/app/provider.tsx` and `apps/web/src/app/layout.tsx`.
 * Make sure to provide the same context with those files.
 */
export const AppDecorator: Decorator = (Story, context) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => {
          return false
        },
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  })

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:6006'

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: () => true,
        }),
        httpLink({
          transformer: SuperJSON,
          url: `${baseUrl}/api/trpc`,
          headers() {
            const headers = new Headers()
            headers.set('x-trpc-source', 'storybook')
            return headers
          },
        }),
      ],
    }),
  )

  return (
    <main className="flex min-h-dvh flex-col">
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <NuqsAdapter>{Story(context)}</NuqsAdapter>
        </TRPCProvider>
      </QueryClientProvider>
    </main>
  )
}
