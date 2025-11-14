import { createTRPCRouter, publicProcedure } from '../../trpc'
import { emailAuthRouter } from './auth.email.router'

export const authRouter = createTRPCRouter({
  email: emailAuthRouter,
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.session.destroy()
    return
  }),
})
