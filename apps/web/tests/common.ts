import type { StartedNetwork, StartedTestContainer } from 'testcontainers'
import { GenericContainer, Wait } from 'testcontainers'
import z from 'zod'

const baseContainerConfiguration = z.object({
  name: z.string(),
  ports: z
    .array(
      z.union([
        z.number(),
        z.object({ container: z.number(), host: z.number() }),
      ]),
    )
    .optional(),
  environment: z.record(z.string(), z.string()).optional(),
  buildArgs: z.record(z.string(), z.string()).optional(),
  extraHosts: z
    .array(z.object({ host: z.string(), ipAddress: z.string() }))
    .optional(),
  command: z.array(z.string()).optional(),
  reuse: z.boolean().optional(),
  wait: z
    .union([
      z.object({ type: z.literal('PORT'), timeout: z.number().optional() }),
      z.object({
        type: z.literal('LOG'),
        message: z.string(),
        times: z.number().optional(),
        timeout: z.number().optional(),
      }),
      z.object({
        type: z.literal('HEALTHCHECK'),
        timeout: z.number().optional(),
      }),
    ])
    .optional(),
})

export const CONTAINER_INFORMATION_SCHEMA = z.array(
  z.object({
    name: z.string(),
    host: z.string(),
    ports: z.map(z.number(), z.number()),
    configuration: baseContainerConfiguration.extend({
      image: z.string(),
    }),
  }),
)

export type ContainerInformation = z.infer<
  typeof CONTAINER_INFORMATION_SCHEMA
>[number]

export type ContainerConfiguration = ContainerInformation['configuration']

type ContainerType = 'database' | 'redis'
export const CONTAINER_CONFIGURATIONS: Record<
  ContainerType,
  ContainerConfiguration
> = {
  database: {
    name: 'database',
    image: 'postgres:latest',
    ports: [5432],
    environment: {
      POSTGRES_DB: 'test',
      POSTGRES_USER: 'root',
      POSTGRES_PASSWORD: 'root',
    },
    wait: { type: 'PORT' },
  },
  redis: {
    name: 'redis',
    image: 'redis',
    ports: [6379],
    wait: { type: 'PORT' },
  },
} as const

export const setup = async (
  configurations: ContainerConfiguration[],
  network?: StartedNetwork,
) => {
  const containerTemplates = configurations.map((configuration) => {
    const {
      name,
      extraHosts,
      ports = [],
      environment,
      command,
      wait,
      reuse,
      image,
    } = configuration

    let container = new GenericContainer(image)

    if (ports.length) {
      container = container.withExposedPorts(...ports)
    }

    if (extraHosts) {
      container = container.withExtraHosts(extraHosts)
    }

    if (environment) {
      container = container.withEnvironment(environment)
    }

    if (command) {
      container = container.withCommand(command)
    }

    if (network) {
      container = container.withNetwork(network).withNetworkAliases(name)
    }

    if (reuse) {
      container = container.withReuse()
    }

    if (wait) {
      const { type, timeout = 60 * 1000 } = wait
      switch (type) {
        case 'PORT':
          container = container
            .withStartupTimeout(timeout)
            .withWaitStrategy(Wait.forListeningPorts())
          break
        case 'LOG':
          container = container
            .withStartupTimeout(timeout)
            .withWaitStrategy(Wait.forLogMessage(wait.message, wait.times ?? 1))
          break
        case 'HEALTHCHECK':
          container = container
            .withStartupTimeout(timeout)
            .withWaitStrategy(Wait.forHealthCheck())
          break
      }
    }

    return {
      name,
      container,
      ports: ports.map((port) =>
        typeof port === 'number' ? port : port.container,
      ),
      configuration,
    }
  })

  const startedContainers = await Promise.all(
    containerTemplates.map(async (containerTemplate) => {
      const { container, ports } = containerTemplate

      const startedContainer = await container.start()

      const host = startedContainer.getHost()

      const mappedPorts = new Map<number, number>()

      for (const port of ports) {
        mappedPorts.set(port, startedContainer.getMappedPort(port))
      }

      return {
        ...containerTemplate,
        host,
        ports: mappedPorts,
        container: startedContainer,
      }
    }),
  )

  return startedContainers
}

export const teardown = async (
  containers: { container: StartedTestContainer }[],
) => {
  await Promise.all(
    containers.map((container) => container.container.stop({ remove: true })),
  )
}
