import type { NextRequest } from 'next/server'

import { createBaseLogger } from '@acme/logging'

import { createApiCaller, handleTRPCError } from '../helpers'

const logger = createBaseLogger({ path: 'api/health' })

// Route basically for ECS health checks, but can also be used for debugging and monitoring the health of the API.
// Route Handlers are not cached by default, so no need to set cache: 'no-store' here, but can be added if desired for clarity.
export async function GET(req: NextRequest) {
  const resHeaders = new Headers()
  try {
    const caller = await createApiCaller(req)
    const result = await caller.healthcheck()

    return Response.json(result, { status: 200, headers: resHeaders })
  } catch (e) {
    logger.error({
      action: 'GET',
      message: 'Healthcheck failed',
      error: e,
    })
    return handleTRPCError(e, 'Healthcheck failed', resHeaders)
  }
}
