import { TRPCError } from '@trpc/server'

import { db } from '@acme/db'

export const healthcheck = async () => {
  try {
    await db.$queryRaw`SELECT 1`

    return {
      database: 'up',
    }
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Healthcheck failed',
      cause: error,
    })
  }
}
