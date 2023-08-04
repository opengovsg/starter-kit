import { type TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc'
import { type AppRouter } from '~/server/modules/_app'
import { getBaseUrl } from '~/utils/getBaseUrl'
import superjson from 'superjson'
import { createTRPCMsw } from 'msw-trpc'

export const trpcMsw = createTRPCMsw<AppRouter>({
  basePath: '/api/trpc',
  baseUrl: getBaseUrl(),
  transformer: {
    input: superjson,
    output: superjson,
  },
})

export const mockTrpcErrorResponse = (error: TRPCError, path?: string) => {
  // Transform error into response, following TRPC's error format
  return {
    error: {
      json: {
        message: error.message,
        code: TRPC_ERROR_CODES_BY_KEY[error.code],
        data: {
          code: error.code,
          httpStatus: getHTTPStatusCodeFromError(error),
          stack: error.stack,
          path: path,
        },
      },
    },
  }
}
