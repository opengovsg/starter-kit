import Redis from 'ioredis'

import { env } from './env'

const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createRedisClient>
}

const createRedisClient = (): Redis | null => {
  if (!env.CACHE_HOSTNAME) {
    console.warn(
      '!!!! CACHE_HOSTNAME is not set, Redis client will not be created. !!!!',
    )
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
    // Only reconnect when the error contains "READONLY"
    // during node failover, this is thrown: 149: -READONLY You can't write against a read only replica.
    reconnectOnError: (error) => error.message.includes('READONLY'),
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
