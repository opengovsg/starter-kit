import {
  IntegreSQLClient,
  type IntegreSQLDatabaseConfig,
} from '@devoxa/integresql-client'

// Sync URL with the port of the IntegreSQL docker container in docker-compose.test.yml
export const integreSQL = new IntegreSQLClient({ url: 'http://localhost:5000' })

// The hash can be generated in any way that fits your business logic, the included
// helper creates a SHA1 hash of the file content of all files matching the glob patterns.
export const hash = await integreSQL.hashFiles([
  './prisma/schema.prisma',
  './tests/integration/__fixtures__/**/*',
])

export const getDatabaseUrl = async (config: IntegreSQLDatabaseConfig) => {
  const { username, password, port, database } = config
  return `postgresql://${username}:${password}@localhost:${port}/${database}`
}
