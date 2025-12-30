/**
 * Redis Testcontainer Setup for E2E Tests
 *
 * This file sets up a Redis container for E2E tests using Testcontainers.
 * It provides utilities to start the container and flush data between tests.
 */
import {
  CONTAINER_CONFIGURATIONS,
  setup as setupContainers,
} from '~tests/common'

type RedisContainer = Awaited<ReturnType<typeof startRedis>>

export const getRedisUrl = (
  container: RedisContainer,
  internalPort?: boolean,
) => {
  const { host, ports } = container
  const port = internalPort ? 6379 : (ports.get(6379) ?? 6379)

  return `redis://${host}:${port}`
}

export const startRedis = async () => {
  const [redisContainer] = await setupContainers([
    {
      ...CONTAINER_CONFIGURATIONS.redis,
      reuse: true,
      // The host port must be the same as in .env.e2e.
      ports: [{ container: 6379, host: 63799 }],
    },
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
