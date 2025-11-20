import { randomUUID } from 'node:crypto'
import { TRPCError } from '@trpc/server'
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
    .mutation(async ({ input, ctx }) => {
      const nonce = randomUUID()
      const { email, otpPrefix } = await emailLogin({
        email: input.email,
        nonce,
      })

      ctx.session.nonce = nonce
      await ctx.session.save()
      return {
        email,
        otpPrefix,
      }
    }),
  verifyOtp: publicProcedure
    .input(emailVerifyOtpSchema)
    .mutation(async ({ input: { email, token }, ctx }) => {
      const nonce = ctx.session.nonce
      // Ensure nonce exists in session
      if (!nonce) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Something went wrong. Please request for a new OTP before retrying.',
        })
      }

      await emailVerifyOtp({ email, token, nonce })
      const user = await upsertUserAndAccountByEmail(email)
      ctx.session.nonce = undefined
      ctx.session.userId = user.id
      await ctx.session.save()
      return user
    }),
})
