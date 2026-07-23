/**
 * Redis Testcontainer Setup for E2E Tests
 *
 * This file sets up a Redis container for E2E tests using Testcontainers.
 * It provides utilities to start the container and flush data between tests.
 */
import { redis, setup } from '@opengovsg/testcontainers'

type RedisContainer = Awaited<ReturnType<typeof startRedis>>

export const startRedis = async () => {
  const [redisContainer] = await setup([
    redis({
      reuse: true,
      // The host port must be the same as in .env.e2e.
      ports: [{ container: 6379, host: 63799 }],
    }),
  ])

  if (!redisContainer) {
    throw new Error('Redis container not started')
  }

  return redisContainer
}

export async function flushRedis(container: RedisContainer) {
  const flushResult = await container.container.exec(['redis-cli', 'FLUSHALL'])

  if (flushResult.exitCode !== 0) {
    console.error('Failed when trying to flush Redis', flushResult)
  } else {
    console.log('Redis flushed')
  }
}
