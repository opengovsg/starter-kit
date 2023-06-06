import { vi } from 'vitest'

vi.mock('./src/server/prisma', () => ({
  prisma: vPrisma.client,
}))
