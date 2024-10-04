import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { readdirSync, readFileSync, statSync } from 'node:fs'

export const makePgliteClient = () => {
  const client = new PGlite()
  const adapter = new PrismaPGlite(client)
  return {
    client,
    prisma: new PrismaClient({ adapter }),
  }
}

export const applyMigrations = async (client: PGlite) => {
  const prismaMigrationDir = './prisma/migrations'
  const directory = readdirSync(prismaMigrationDir).sort()
  for (const file of directory) {
    const name = `${prismaMigrationDir}/${file}`
    if (statSync(name).isDirectory()) {
      const migration = readFileSync(`${name}/migration.sql`, 'utf8')
      await client.exec(migration)
    }
  }
}
