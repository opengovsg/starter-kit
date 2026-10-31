import { redis, setup } from '@opengovsg/testcontainers'

export const startRedis = async () => {
  const [cache] = await setup([
    // Host port must match .env.e2e. `reuse` keeps the container warm across local runs.
    redis({ ports: [{ container: 6379, host: 63_799 }], reuse: true }),
  ])

  if (!cache) {
    throw new Error('E2E Redis container failed to start')
  }

  return cache
}

export const flushRedis = async (
  cache: Awaited<ReturnType<typeof startRedis>>
) => {
  const result = await cache.container.exec(['redis-cli', 'FLUSHALL'])

  if (result.exitCode !== 0) {
    throw new Error(`Failed to flush Redis: ${result.output}`)
  }
}
