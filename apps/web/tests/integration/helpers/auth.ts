import { type User } from '@prisma/client'
import { type SetOptional } from 'type-fest'

import { prisma } from '~/server/prisma'

export const auth = (user: SetOptional<User, 'id'>) => {
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
