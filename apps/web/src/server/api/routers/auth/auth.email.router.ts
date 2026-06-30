import z from 'zod'

import { createTRPCRouter, publicProcedure } from '../../trpc'

import { createLogger } from '~/lib/logger'
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

      // ctx.logger was built from the pre-login session, so it lacks the
      // user_id / correlation_id bindings. Rebuild it with the freshly
      // created identity so the login audit lines carry the same correlation
      // fields as the session's subsequent requests.
      const logger = createLogger({
        path: 'auth.email.verifyOtp',
        headers: ctx.headers,
        userId: user.id,
        sessionId,
      })
      logger.audit.authn.sessionCreated({ sessionId })
      logger.audit.authn.loginSucceeded({
        userId: user.id,
        username: user.email,
        sessionId,
        role: 'user',
        privileged: true,
      })
      return user
    }),
})
