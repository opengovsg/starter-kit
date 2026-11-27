import Redis from 'ioredis'

import { createBaseLogger } from '@acme/logging'

import { env } from './env'

const logger = createBaseLogger.system({ path: 'redis' })

declare global {
  var redis: ReturnType<typeof createRedisClient> | undefined
}

const createRedisClient = (): Redis | null => {
  if (env.CACHE_HOSTNAME === undefined || env.CACHE_HOSTNAME === '') {
    logger.warn({
      message: 'CACHE_HOSTNAME is not set. Redis client will not be created.',
    })

    return null
  }

  const redisClient = new Redis({
    host: env.CACHE_HOSTNAME,
    password: env.CACHE_PASSWORD,
    port: env.CACHE_PORT,
    // Only reconnect when the error contains "READONLY"
    // during node failover, this is thrown: 149: -READONLY You can't write against a read only replica.
    reconnectOnError: (error) => error.message.includes('READONLY'),
    retryStrategy: (attempt) => Math.min(attempt * 100, 5000),
    username: env.CACHE_USERNAME,
  })

  redisClient.on('error', (err) => {
    logger.error({
      error: err,
      message: 'Redis client error',
    })
  })

  return redisClient
}

export const redis =
  globalThis.redis === undefined ? createRedisClient() : globalThis.redis

if (process.env.NODE_ENV !== 'production') {
  globalThis.redis = redis
}
