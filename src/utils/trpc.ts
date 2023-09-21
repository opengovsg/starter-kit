import {
  httpBatchLink,
  loggerLink,
  TRPCClientError,
  type TRPCLink,
} from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { type NextPageContext } from 'next'
import superjson from 'superjson'
import { TRPCWithErrorCodeSchema } from '~/utils/error'
// ℹ️ Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
import type { AppRouter } from '~/server/modules/_app'
import { getBaseUrl } from './getBaseUrl'
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { LOGGED_IN_KEY } from '~/constants/localStorage'
import { observable } from '@trpc/server/observable'

const NON_RETRYABLE_ERROR_CODES: Set<TRPC_ERROR_CODE_KEY> = new Set([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
])

export const custom401Link: TRPCLink<AppRouter> = () => {
  // here we just got initialized in the app - this happens once per app
  // useful for storing cache for instance
  return ({ next, op }) => {
    // this is when passing the result to the next link
    // each link needs to return an observable which propagates results
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        // Handle 401 errors
        error(err) {
          observer.error(err)
          if (window !== undefined && err?.data?.code === 'UNAUTHORIZED') {
            // Clear logged in state on localStorage
            // NOTE: This error is not handled in the /api/[trpc] API route as API routes are invoked
            // on the server and cannot perform redirections.
            // We can think of this handler function as a form of client side auth validity
            // handling, and the /api/[trpc] API route as a form of server side auth validity handling.
            window.localStorage.removeItem(LOGGED_IN_KEY)
            window.dispatchEvent(new Event('local-storage'))
          }
        },
        complete() {
          observer.complete()
        },
      })
      return unsubscribe
    })
  }
}

const isErrorRetryableOnClient = (error: unknown): boolean => {
  if (typeof window === 'undefined') return true
  if (!(error instanceof TRPCClientError)) return true
  const res = TRPCWithErrorCodeSchema.safeParse(error)
  return !res.success || !NON_RETRYABLE_ERROR_CODES.has(res.data)
}

/**
 * Extend `NextPageContext` with meta data that can be picked up by `responseMeta()` when server-side rendering
 */
export interface SSRContext extends NextPageContext {
  /**
   * Set HTTP Status code
   * @example
   * const utils = trpc.useContext();
   * if (utils.ssrContext) {
   *   utils.ssrContext.status = 404;
   * }
   */
  status?: number
}

/**
 * A set of strongly-typed React hooks from your `AppRouter` type signature with `createReactQueryHooks`.
 * @link https://trpc.io/docs/react#3-create-trpc-hooks
 */
export const trpc = createTRPCNext<
  AppRouter,
  SSRContext,
  'ExperimentalSuspense'
>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        custom401Link,
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/ssr
           */
          headers() {
            if (ctx?.req) {
              // To use SSR properly, you need to forward the client's headers to the server
              // This is so you can pass through things like cookies when we're server-side rendering

              // If you're using Node 18, omit the "connection" header
              const { connection: _connection, ...headers } = ctx.req.headers
              return {
                ...headers,
                // Optional: inform server that it's an SSR request
                'x-ssr': '1',
              }
            }
            return {}
          },
        }),
      ],
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 1000 * 10, // 10 seconds
            retry: (failureCount, error) => {
              if (!isErrorRetryableOnClient(error)) return false
              return failureCount < 3
            },
          },
          mutations: {
            retry: (_, error) => {
              return isErrorRetryableOnClient(error)
            },
          },
        },
      },
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
  /**
   * Set headers or status code when doing SSR
   */
  // responseMeta(opts) {
  //   const ctx = opts.ctx as SSRContext;

  //   if (ctx.status) {
  //     // If HTTP status set, propagate that
  //     return {
  //       status: ctx.status,
  //     };
  //   }

  //   const error = opts.clientErrors[0];
  //   if (error) {
  //     // Propagate http first error from API calls
  //     return {
  //       status: error.data?.httpStatus ?? 500,
  //     };
  //   }

  //   // for app caching with SSR see https://trpc.io/docs/caching

  //   return {};
  // },
})

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
