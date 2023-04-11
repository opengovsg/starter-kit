import { createServerSideHelpers } from '@trpc/react-query/server'
import { IronSession } from 'iron-session'
import SuperJSON from 'superjson'
import { createContext } from '~/server/context'
import { appRouter } from '~/server/modules/_app'

export const createSsgHelper = async (session?: IronSession) => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: await createContext({ session }),
    transformer: SuperJSON,
  })
}
