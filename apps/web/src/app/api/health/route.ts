import type { NextRequest } from 'next/server'

import { createApiCaller, handleTRPCError } from '../helpers'

// Route basically for ECS health checks, but can also be used for debugging and monitoring the health of the API.
export async function GET(req: NextRequest) {
  try {
    const caller = await createApiCaller(req)
    const result = await caller.healthcheck()

    return Response.json(result, { status: 200 })
  } catch (e) {
    return handleTRPCError(e, 'Healthcheck failed')
  }
}
