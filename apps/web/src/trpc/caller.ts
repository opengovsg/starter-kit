import { appRouter } from '~/server/api/root'
import { createCallerFactory } from '~/server/api/trpc'

export const callerFactory = createCallerFactory(appRouter)
