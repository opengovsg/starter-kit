import Redis from 'ioredis'

import { env } from './env'

declare global {
  var redis: ReturnType<typeof createRedisClient> | undefined
}

const createRedisClient = (): Redis | null => {
  if (env.CACHE_HOSTNAME === undefined || env.CACHE_HOSTNAME === '') {
    console.warn(
      '!!!! CACHE_HOSTNAME is not set, Redis client will not be created. !!!!'
    )
    return null
  }

  const redisClient = new Redis({
    host: env.CACHE_HOSTNAME,
    password: env.CACHE_PASSWORD,
    port: env.CACHE_PORT,
    reconnectOnError: (error) => error.message.includes('READONLY'),
    retryStrategy: (attempt) => Math.min(attempt * 100, 5000),
    username: env.CACHE_USERNAME,
    // Only reconnect when the error contains "READONLY"
    // during node failover, this is thrown: 149: -READONLY You can't write against a read only replica.
  })

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err.message)
  })

  return redisClient
}

export const redis =
  globalThis.redis === undefined ? createRedisClient() : globalThis.redis
