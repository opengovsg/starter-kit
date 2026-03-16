import type { ScopedLogger, WithLogger } from '@acme/logging'
import { db } from '@acme/db'

export const healthcheck = async ({ logger }: WithLogger<ScopedLogger>) => {
  try {
    await db.$queryRaw`SELECT 1`

    return {
      database: 'up',
    }
  } catch (error) {
    logger.error({
      message: 'Database connection failed',
      error,
    })
    return {
      database: 'down',
    }
  }
}
