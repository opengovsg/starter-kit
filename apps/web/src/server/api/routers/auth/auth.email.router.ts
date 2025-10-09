import { emailLogin, emailVerifyOtp } from '~/server/modules/auth/auth.service'
import { upsertUserAndAccountByEmail } from '~/server/modules/user/user.service'
import { emailSignInSchema, emailVerifyOtpSchema } from '~/validators/auth'
import { createTRPCRouter, publicProcedure } from '../../trpc'

export const emailAuthRouter = createTRPCRouter({
  // TODO: Implement rate limiting for auth endpoints
  login: publicProcedure
    .input(emailSignInSchema)
    .mutation(async ({ input: { email } }) => {
      return emailLogin(email)
    }),
  verifyOtp: publicProcedure
    .input(emailVerifyOtpSchema)
    .mutation(async ({ input, ctx }) => {
      await emailVerifyOtp(input)
      const user = await upsertUserAndAccountByEmail(input.email)

      ctx.session.userId = user.id
      await ctx.session.save()
      return user
    }),
})
