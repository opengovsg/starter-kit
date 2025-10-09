import { emailLogin } from '~/server/modules/auth/auth.service'
import { emailSignInSchema } from '~/validators/auth'
import { createTRPCRouter, publicProcedure } from '../../trpc'

export const emailAuthRouter = createTRPCRouter({
  // TODO: Implement rate limiting for auth endpoints
  login: publicProcedure
    .input(emailSignInSchema)
    .mutation(async ({ input: { email } }) => {
      return emailLogin(email)
    }),
})
