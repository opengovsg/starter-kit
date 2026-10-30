import type { NextRequest } from 'next/server'

import { createApiCaller, handleTRPCError } from '../helpers'

export const GET = async (req: NextRequest) => {
  try {
    const caller = await createApiCaller(req)
    const result = await caller.healthcheck()

    return Response.json(result, { status: 200 })
  } catch (error) {
    return handleTRPCError(error, 'Healthcheck failed')
  }
}
