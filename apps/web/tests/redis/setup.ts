/**
 * Test Redis Setup
 *
 * This file sets up Redis connection for tests using Testcontainers.
 * It mocks the Redis client to use the test Redis instance.
 */

import {
  getContainer,
  getRedisUrl,
} from '@opengovsg/starter-kitty-testcontainers'
import { getWorkerDatabaseIndex } from '@opengovsg/starter-kitty-testcontainers/vitest'

import { Redis } from '@acme/redis/testing'

// Keep in sync with `redis({ databases })` in global-setup.ts.
const REDIS_DATABASES = 256

const redisUrl = getRedisUrl(getContainer('redis'))

export const redis = new Redis(redisUrl)

vi.mock('@acme/redis', () => ({
  redis,
}))

// Give each test worker its own logical DB (the container is started with more
// DBs than there are workers); flushing it before each test isolates tests
// within a file.
await redis.select(getWorkerDatabaseIndex(REDIS_DATABASES))

beforeEach(async () => {
  await redis.flushdb()
})
