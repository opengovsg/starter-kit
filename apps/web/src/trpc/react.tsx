'use client'

import { useState } from 'react'

import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpLink, loggerLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import SuperJSON from 'superjson'

import { createQueryClient } from './query-client'

import { APP_VERSION_HEADER_KEY, REQUIRE_UPDATE_EVENT } from '~/constants'
import { env } from '~/env'
import type { AppRouter } from '~/server/api/root'
import { getBaseUrl } from '~/utils/get-base-url'

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

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpLink({
          transformer: SuperJSON,
          url: getBaseUrl() + '/api/trpc',
          headers() {
            const headers = new Headers()
            headers.set('x-trpc-source', 'react')
            if (env.VITE_APP_VERSION) {
              headers.set(APP_VERSION_HEADER_KEY, env.VITE_APP_VERSION)
            }
            return headers
          },
          fetch(url, options) {
            return fetch(url, options).then((response) => {
              const serverVersion = response.headers.get(APP_VERSION_HEADER_KEY)
              if (
                serverVersion &&
                env.VITE_APP_VERSION &&
                serverVersion !== env.VITE_APP_VERSION
              ) {
                window.dispatchEvent(new Event(REQUIRE_UPDATE_EVENT))
              }
              return response
            })
          },
        }),
      ],
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
