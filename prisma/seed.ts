/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add first test user.
  await prisma.user.upsert({
    where: { email: 'test@open.gov.sg' },
    update: {},
    create: {
      email: 'test@open.gov.sg',
      name: 'Test User',
      posts: {
        create: {
          title: 'Check out Prisma with Next.js',
          contentHtml: 'This is an example post generated from `prisma/seed.ts',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
