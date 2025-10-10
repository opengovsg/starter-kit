import { notFound, redirect } from 'next/navigation'
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { isTRPCClientError } from '@trpc/client'
import { TRPCError } from '@trpc/server'
import get from 'lodash-es/get'
import SuperJSON from 'superjson'
import z from 'zod'

const cacheErrorHandler = (error: unknown) => {
  // TRPCErrors are being converted to TRPCClientErrors on the client side
  if (isTRPCClientError(error)) {
    const errorCode = z.string().safeParse(get(error.data, 'code')).data ?? ''
    switch (errorCode) {
      case 'UNAUTHORIZED':
        // Force a reload so layout checks can retrigger
        // TODO: Add redirect back to current page after login if we want to support that
        window.location.reload()
        break
    }
  }

  // Server side errors
  if (error instanceof TRPCError) {
    switch (error.code) {
      case 'NOT_FOUND':
        notFound()
      // eslint-disable-next-line no-fallthrough
      case 'UNAUTHORIZED':
        redirect('/sign-in')
    }
  }
}

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: cacheErrorHandler,
    }),
    mutationCache: new MutationCache({
      onError: cacheErrorHandler,
    }),
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
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
