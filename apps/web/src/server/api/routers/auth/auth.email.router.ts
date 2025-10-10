import z from 'zod'

import { emailLogin, emailVerifyOtp } from '~/server/modules/auth/auth.service'
import { upsertUserAndAccountByEmail } from '~/server/modules/user/user.service'
import {
  emailSignInSchema,
  emailVerifyOtpSchema,
  OTP_PREFIX_LENGTH,
} from '~/validators/auth'
import { createTRPCRouter, publicProcedure } from '../../trpc'

export const emailAuthRouter = createTRPCRouter({
  // TODO: Implement rate limiting for auth endpoints
  login: publicProcedure
    .input(emailSignInSchema)
    .output(
      z.object({
        email: z.email(),
        otpPrefix: z.string().length(OTP_PREFIX_LENGTH),
      }),
    )
    .mutation(async ({ input }) => {
      const { email, otpPrefix } = await emailLogin(input.email)
      return {
        email,
        otpPrefix,
      }
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
