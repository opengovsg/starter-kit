import { getRequest } from '@tanstack/react-start/server'

import { createTRPCContext } from '~/server/api/trpc'

export async function createContext() {
  const heads = new Headers(getRequest().headers)
  heads.set('x-trpc-source', 'server')

  return createTRPCContext({
    headers: heads,
  })
}
