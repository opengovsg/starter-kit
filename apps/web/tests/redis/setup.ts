/* eslint-disable no-restricted-properties */
/* eslint-disable turbo/no-undeclared-env-vars */
/**
 * Test Redis Setup
 *
 * This file sets up Redis connection for tests using Testcontainers.
 * It configures the REDIS_URL environment variable to point to the
 * Redis container started during test setup.
 */

import { parse } from 'superjson'

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
process.env.REDIS_URL = redisUrl
