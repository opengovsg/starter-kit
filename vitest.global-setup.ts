import { execSync } from 'child_process'
import path from 'path'
import { PrismaClient } from '@prisma/client'

import {
  getDatabaseUrl,
  hash,
  integreSQL,
} from '~tests/integration/helpers/hooks'

export default async function setup() {
  await integreSQL.initializeTemplate(hash, async (databaseConfig) => {
    const connectionUrl = await getDatabaseUrl(databaseConfig)

    console.log('Migrating template database')
    const prismaBin = path.join(process.cwd(), './node_modules/.bin/prisma')
    const env = {
      NODE_ENV: 'development',
      DATABASE_URL: connectionUrl,
      PATH: process.env.PATH,
    } as const
    execSync(`${prismaBin} db push --force-reset --skip-generate`, {
      env,
      stdio: 'inherit',
    })

    const prisma = new PrismaClient({
      datasources: { db: { url: connectionUrl } },
    })

    // console.log('Seeding template database')
    // await seed(prisma)

    // Close the database connection, without this the tests can hang
    await prisma.$disconnect()
  })
}
