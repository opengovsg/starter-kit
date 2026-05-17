import { createFileRoute } from '@tanstack/react-router'

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { APP_VERSION_HEADER_KEY } from '~/constants'
import { env } from '~/env'
import { appRouter } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'

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

const trpcHandler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    allowBatching: false,
    createContext: ({ resHeaders }) =>
      createTRPCContext({
        headers: req.headers,
        resHeaders,
      }),
    onError({ error, path, ctx }) {
      if (error.code === 'UNAUTHORIZED') {
        ctx?.session.destroy()
      }
      console.error(`>>> tRPC Error on '${path}'`, error)
    },
  })

  setCorsHeaders(response)
  if (env.VITE_APP_VERSION) {
    response.headers.set(APP_VERSION_HEADER_KEY, env.VITE_APP_VERSION)
  }
  return response
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      OPTIONS: async () => {
        const response = new Response(null, { status: 204 })
        setCorsHeaders(response)
        return response
      },
      GET: async ({ request }) => trpcHandler(request),
      POST: async ({ request }) => trpcHandler(request),
    },
  },
})
