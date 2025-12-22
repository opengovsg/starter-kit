import Redis from 'ioredis'

import { env } from './env'

const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createRedisClient>
}

const createRedisClient = (): Redis | null => {
  if (!env.CACHE_HOSTNAME) {
    return null
  }

  const redisClient = new Redis({
    host: env.CACHE_HOSTNAME,
    port: env.CACHE_PORT,
    username: env.CACHE_USERNAME,
    password: env.CACHE_PASSWORD,
    retryStrategy: (attempt) => {
      return Math.min(attempt * 100, 5000)
    },
  })

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err.message)
  })

  return redisClient
}

export const redis =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  globalForRedis.redis !== undefined
    ? globalForRedis.redis
    : createRedisClient()
