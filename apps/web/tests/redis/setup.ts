/* eslint-disable no-restricted-properties */
/* eslint-disable turbo/no-undeclared-env-vars */
/**
 * Test Redis Setup
 *
 * This file sets up Redis connection for tests using Testcontainers.
 * It mocks the Redis client to use the test Redis instance.
 */

import { parse } from 'superjson'

import { Redis } from '@acme/redis/testing'

import { CONTAINER_INFORMATION_SCHEMA } from '../common'

const parsed = CONTAINER_INFORMATION_SCHEMA.parse(
  parse(process.env.testcontainers ?? ''),
)
const redisContainer = parsed.find((c) => c.configuration.name === 'redis')

if (!redisContainer) {
  console.log('cannot find redis container')
  throw new Error('Cannot find redis container')
}

const { host: redisHost, ports: redisPorts } = redisContainer
const redisPort = redisPorts.get(6379) ?? 6379

// Set up Redis URL for tests
const redisUrl = `redis://${redisHost}:${redisPort}`

export const redis = new Redis(redisUrl)

vi.mock('@acme/redis', () => ({
  redis,
}))
