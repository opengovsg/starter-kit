import type { NextRequest } from 'next/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'

import { appRouter } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { TRPCRateLimitError } from '~/server/modules/rate-limit/errors'

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Request-Method', '*')
  res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
  res.headers.set('Access-Control-Allow-Headers', '*')
}

export const OPTIONS = () => {
  const response = new Response(null, {
    status: 204,
  })
  setCorsHeaders(response)
  return response
}

const handler = async (req: NextRequest) => {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
      }),
    onError({ error, path, ctx }) {
      if (error.code === 'UNAUTHORIZED') {
        ctx?.session.destroy()
      }
      console.error(`>>> tRPC Error on '${path}'`, error)
    },
    responseMeta(opts) {
      const { errors } = opts
      const firstError = errors[0]
      if (firstError) {
        if (firstError instanceof TRPCRateLimitError) {
          return {
            status: getHTTPStatusCodeFromError(firstError),
            headers: new Headers([
              ['Retry-After', String(firstError.retryAfterSeconds)],
            ]),
          }
        }
        return {
          status: getHTTPStatusCodeFromError(firstError),
        }
      }

      return {}
    },
  })

  setCorsHeaders(response)
  return response
}

export { handler as GET, handler as POST }
