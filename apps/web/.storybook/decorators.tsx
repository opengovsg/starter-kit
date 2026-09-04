import type { Decorator } from '@storybook/nextjs-vite'
import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { createTRPCClient, httpLink, loggerLink } from '@trpc/client'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { deserialize, serialize } from 'superjson'

import type { AppRouter } from '~/server/api/root'
import { TRPCProvider } from '~/trpc/react'

const hasWindow = () => 'window' in globalThis

const createStorybookTrpcClient = (baseUrl: string) =>
  createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: () => true,
      }),
      httpLink({
        headers() {
          const headers = new Headers()
          headers.set('x-trpc-source', 'storybook')
          return headers
        },
        transformer: { deserialize, serialize },
        url: `${baseUrl}/api/trpc`,
      }),
    ],
  })

/**
 * This decorator wraps stories with TRPC and React Query and the other app-level providers.
 * It mimics the setup in `apps/web/src/app/provider.tsx` and `apps/web/src/app/layout.tsx`.
 * Make sure to provide the same context with those files.
 */
export const AppDecorator: Decorator = (Story, context) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: {
        serializeData: serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => false,
      },
      hydrate: {
        deserializeData: deserialize,
      },
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: Infinity,
      },
    },
  })

  const baseUrl = hasWindow()
    ? globalThis.window.location.origin
    : 'http://localhost:6006'

  const trpcClient = createStorybookTrpcClient(baseUrl)

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
