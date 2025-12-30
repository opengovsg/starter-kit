/* eslint-disable no-restricted-properties */
import { stringify } from 'superjson'

import type { ContainerInformation } from './common'
import { CONTAINER_CONFIGURATIONS, setup, teardown } from './common'

export default async () => {
  const containers = await setup([
    CONTAINER_CONFIGURATIONS.database,
    CONTAINER_CONFIGURATIONS.redis,
  ])

  Object.defineProperty(process.env, 'testcontainers', {
    value: stringify(
      containers.map((container) => {
        const { container: _, ...rest } = container
        const result: ContainerInformation = rest
        return result
      }),
    ),
    configurable: true,
    writable: true,
    enumerable: true,
  })

  return () => teardown(containers)
}
