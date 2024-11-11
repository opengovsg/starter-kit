import { type User } from '@prisma/client'
import { trpcMsw } from '../mockTrpc'
import { TRPCError } from '@trpc/server'

export const defaultUser: User = {
  id: 'cljcnahpn0000xlwynuea40lv',
  bio: null,
  email: 'test@example.com',
  emailVerified: new Date('2023-06-26T09:17:05.194Z'),
  username: 'testUser',
  image: null,
  name: 'Test User',
}

const defaultMeGetQuery = () => {
  return trpcMsw.me.get.query(() => {
    return defaultUser
  })
}

const unauthorizedMeGetQuery = () => {
  return trpcMsw.me.get.query(() => {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  })
}

export const meHandlers = {
  me: defaultMeGetQuery,
  unauthorized: unauthorizedMeGetQuery,
}
