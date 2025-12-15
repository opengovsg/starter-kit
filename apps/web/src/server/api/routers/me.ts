import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { getUserById } from '~/server/modules/user/user.service'

export const meRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getUserById(ctx.session.userId)
  }),
})
