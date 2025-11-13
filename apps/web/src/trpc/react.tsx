'use client'

import type { QueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  createTRPCClient,
  httpBatchLink,
  httpBatchStreamLink,
  loggerLink,
  splitLink,
} from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import SuperJSON from 'superjson'

import type { AppRouter } from '~/server/api/root'
import { env } from '~/env'
import { getBaseUrl } from '~/utils/get-base-url'
import { createQueryClient } from './query-client'

let clientQueryClientSingleton: QueryClient | undefined = undefined
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient())
  }
}

export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>()

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const common = useMemo(() => {
    return {
      transformer: SuperJSON,
      url: getBaseUrl() + '/api/trpc',
      headers() {
        const headers = new Headers()
        headers.set('x-trpc-source', 'nextjs-react')
        return headers
      },
    }
  }, [])

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        // By default, we use httpBatchStreamLink for better performance with RSC.
        // If you require the ability to change/set response headers (which includes cookies) from within your procedures,
        // make sure to set `skipStreaming: true` in the context!
        // This is due to the fact that httpBatchStreamLink does not support setting headers once the stream has begun.
        splitLink({
          condition(op) {
            return Boolean(op.context.skipStreaming)
          },
          true: httpBatchLink(common),
          // See https://trpc.io/docs/client/links/httpBatchStreamLink
          false: httpBatchStreamLink(common),
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
