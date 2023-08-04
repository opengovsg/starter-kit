import { type User } from '@prisma/client'
import { mockTrpcErrorResponse, trpcMsw } from '../mockTrpc'
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
  return trpcMsw.me.get.query((_req, res, ctx) => {
    return res(ctx.status(200), ctx.data(defaultUser))
  })
}

const unauthorizedMeGetQuery = () => {
  return trpcMsw.me.get.query((_req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json(mockTrpcErrorResponse(new TRPCError({ code: 'UNAUTHORIZED' })))
    )
  })
}

export const meHandlers = {
  me: defaultMeGetQuery,
  unauthorized: unauthorizedMeGetQuery,
}
