import type { NextRequest } from 'next/server'
import { TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'

import { callerFactory, createTRPCContext } from '~/server/api/trpc'

/**
 * Helper to create a tRPC caller for REST API endpoints
 * @param req - The Next.js request object
 * @param resHeaders - Optional response headers object for rate limit headers
 */
export async function createApiCaller(req: NextRequest, resHeaders?: Headers) {
  const headers = new Headers(req.headers)
  headers.set('x-trpc-source', 'rest-api')

  return callerFactory(
    await createTRPCContext({
      headers,
      resHeaders,
    }),
  )
}

/**
 * Helper to handle tRPC errors and convert them to REST responses
 */
export function handleTRPCError(
  e: unknown,
  fallbackMessage = 'Request failed',
  headers?: HeadersInit,
) {
  if (e instanceof TRPCError) {
    const statusCode = getHTTPStatusCodeFromError(e)
    return Response.json(
      { error: e.message || fallbackMessage },
      { status: statusCode, headers },
    )
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500, headers },
  )
}
