import { createTRPCMsw } from 'msw-trpc'
import superjson from 'superjson'

import { getBaseUrl } from '~/utils/getBaseUrl'
import { type AppRouter } from '~/server/modules/_app'

export const trpcMsw = createTRPCMsw<AppRouter>({
  basePath: '/api/trpc',
  baseUrl: getBaseUrl(),
  transformer: {
    input: superjson,
    output: superjson,
  },
})
