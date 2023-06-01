/**
 * This file contains tRPC's HTTP response handler
 */
import * as trpcNext from '@trpc/server/adapters/next'
import { createBaseLogger } from '~/lib/logger'
import { createContext } from '~/server/context'
import { appRouter } from '~/server/modules/_app'

export default trpcNext.createNextApiHandler({
  router: appRouter,
  /**
   * @link https://trpc.io/docs/context
   */
  createContext,
  /**
   * @link https://trpc.io/docs/error-handling
   */
  onError({ error, path }) {
    // This is logger re-creation is needed because trpc does not know if the logger middleware has been reached up till this point
    // path can also be undefined if any error was thrown before that
    const logger = createBaseLogger(path ?? 'no path found')

    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // send to bug reporting
      logger.error('Something went wrong', error)
    }
  },
  /**
   * Enable query batching
   */
  batching: {
    enabled: true,
  },
  /**
   * @link https://trpc.io/docs/caching#api-response-caching
   */
  // responseMeta() {
  //   // ...
  // },
})
