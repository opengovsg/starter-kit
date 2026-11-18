import { getRedisUrl } from '@opengovsg/testcontainers'
import { getWorkerDatabaseIndex } from '@opengovsg/testcontainers/vitest'
import { inject, vi } from 'vitest'

const REDIS_DATABASES = 256

const { redis: redisContainer } = inject('testcontainers')

if (!redisContainer) {
  throw new Error('redis container not provided by global-setup.ts')
}

const redisUrl = new URL(getRedisUrl(redisContainer))

process.env.CACHE_HOSTNAME = redisUrl.hostname

process.env.CACHE_PORT = redisUrl.port

if (redisUrl.password !== '') {
  process.env.CACHE_PASSWORD = decodeURIComponent(redisUrl.password)
}

if (redisUrl.username !== '') {
  process.env.CACHE_USERNAME = decodeURIComponent(redisUrl.username)
}

Reflect.deleteProperty(globalThis, 'redis')

vi.resetModules()

const { redis } = await import('@acme/redis')

if (!redis) {
  throw new Error('Redis client was not created for tests')
}

await redis.select(getWorkerDatabaseIndex(REDIS_DATABASES))

beforeEach(async () => {
  await redis.flushdb()
})
