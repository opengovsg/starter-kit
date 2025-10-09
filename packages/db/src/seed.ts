/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { db } from '.'

async function main() {
  // Add seed data here
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await db.$disconnect()
  })
