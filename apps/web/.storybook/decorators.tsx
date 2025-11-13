import type { Decorator } from '@storybook/nextjs-vite'
import { useState } from 'react'
import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { createTRPCClient, httpLink } from '@trpc/client'
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

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpLink({
          transformer: SuperJSON,
          url: '/api/trpc',
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
