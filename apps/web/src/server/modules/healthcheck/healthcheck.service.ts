import { db } from '@acme/db'

export const healthcheck = async () => {
  try {
    await db.$queryRaw`SELECT 1`

    return {
      database: 'up',
    }
  } catch {
    return {
      database: 'down',
    }
  }
}
