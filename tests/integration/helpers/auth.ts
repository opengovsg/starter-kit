import { type User } from '@prisma/client'
import { prisma } from '~/server/prisma'

export const auth = (user: Partial<User>) => {
  if (user.id) {
    return prisma.user.upsert({
      where: { id: user.id },
      create: user,
      update: {},
    })
  }
  return prisma.user.create({
    data: user,
  })
}
