import type { NextRequest } from 'next/server'

import { TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'

import { createTRPCContext } from '~/server/api/trpc'
import { callerFactory } from '~/trpc/caller'

/**
 * Helper to create a tRPC caller for REST API endpoints
 * @param req - The Next.js request object
 * @param resHeaders - Optional response headers object for rate limit headers
 */
export const createApiCaller = async (
  req: NextRequest,
  resHeaders?: Headers
) =>
  callerFactory(
    await createTRPCContext({
      headers: req.headers,
      resHeaders,
    })
  )

/**
 * Helper to handle tRPC errors and convert them to REST responses
 */
export const handleTRPCError = (
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- REST boundary accepts arbitrary thrown values before narrowing to TRPCError.
  apiFailure: unknown,
  fallbackMessage = 'Request failed',
  headers?: HeadersInit
) => {
  if (apiFailure instanceof TRPCError) {
    const statusCode = getHTTPStatusCodeFromError(apiFailure)
    return Response.json(
      { error: apiFailure.message || fallbackMessage },
      { headers, status: statusCode }
    )
  }

  return Response.json(
    { error: 'Internal server error' },
    { headers, status: 500 }
  )
}
