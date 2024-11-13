import { type User } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { trpcMsw } from '../mockTrpc'

export const defaultUser: User = {
  id: 'cljcnahpn0000xlwynuea40lv',
  email: 'test@example.com',
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
