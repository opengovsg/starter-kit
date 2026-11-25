/**
 * Adds seed data to your db
 *
 * @see https://www.prisma.io/docs/guides/database/seed-database
 */
import { db } from '../src/index'

const main = async () => {
  // Add seed data here
}

try {
  await main()
} catch (error: unknown) {
  console.error(error)
  throw error
} finally {
  await db.$disconnect()
}
