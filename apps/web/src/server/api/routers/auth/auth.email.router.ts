import z from 'zod'

import { createTRPCRouter, publicProcedure } from '../../trpc'

import { emailLogin, emailVerifyOtp } from '~/server/modules/auth/auth.service'
import { loginUserByEmail } from '~/server/modules/user/user.service'
import {
  emailSignInSchema,
  emailVerifyOtpSchema,
  OTP_PREFIX_LENGTH,
} from '~/validators/auth'

export const emailAuthRouter = createTRPCRouter({
  // TODO: Implement rate limiting for auth endpoints
  login: publicProcedure
    .input(emailSignInSchema)
    .output(
      z.object({
        email: z.email(),
        otpPrefix: z.string().length(OTP_PREFIX_LENGTH),
      })
    )
    .mutation(async ({ input: { email, codeChallenge } }) => {
      // returnedEmail may differ from input email
      const { email: returnedEmail, otpPrefix } = await emailLogin({
        email,
        codeChallenge,
      })

      return {
        email: returnedEmail,
        otpPrefix,
      }
    }),
  verifyOtp: publicProcedure
    .input(emailVerifyOtpSchema)
    .mutation(async ({ input: { email, token, codeVerifier }, ctx }) => {
      await emailVerifyOtp({ email, token, codeVerifier, logger: ctx.logger })
      const user = await loginUserByEmail(email)
      const sessionId = crypto.randomUUID()
      ctx.session.userId = user.id
      ctx.session.sessionId = sessionId
      await ctx.session.save()

      // userId is payload-borne on these events, so ctx.logger (already carrying
      // client_ip / user_agent from headers) is sufficient; no rebuild needed.
      ctx.logger.audit.authn.sessionCreated({ sessionId, userId: user.id })
      ctx.logger.audit.authn.loginSucceeded({
        userId: user.id,
        username: user.email,
        sessionId,
        role: 'user',
        privileged: true,
      })
      return user
    }),
})
