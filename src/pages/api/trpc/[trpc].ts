/**
 * This file contains tRPC's HTTP response handler
 */
import * as trpcNext from '@trpc/server/adapters/next'

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
  onError({ error, ctx }) {
    if (error.code === 'UNAUTHORIZED') {
      ctx?.session?.destroy()
    }
  },
  batching: {
    /**
     * Disable query batching for better logging (and since we mostly self-host the app without Serverless)
     */
    enabled: false,
  },
  /**
   * @link https://trpc.io/docs/caching#api-response-caching
   */
  // responseMeta() {
  //   // ...
  // },
})
