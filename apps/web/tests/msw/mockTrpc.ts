import { createTRPCMsw } from 'msw-trpc'
import superjson from 'superjson'

import { type AppRouter } from '~/server/modules/_app'
import { getBaseUrl } from '~/utils/getBaseUrl'

export const trpcMsw = createTRPCMsw<AppRouter>({
  basePath: '/api/trpc',
  baseUrl: getBaseUrl(),
  transformer: {
    input: superjson,
    output: superjson,
  },
})
