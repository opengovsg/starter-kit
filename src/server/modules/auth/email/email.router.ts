import { TZDate } from '@date-fns/tz'
import { TRPCError } from '@trpc/server'
import { format } from 'date-fns/format'

import { getBaseUrl } from '~/utils/getBaseUrl'
import { normaliseEmail } from '~/utils/zod'
import { env } from '~/env.mjs'
import { sendMail } from '~/lib/mail'
import {
  emailSignInSchema,
  emailVerifyOtpSchema,
} from '~/schemas/auth/email/sign-in'
import { publicProcedure, router } from '~/server/trpc'
import { defaultMeSelect } from '../../me/me.select'
import { AccountProvider } from '../auth.constants'
import { VerificationError } from '../auth.error'
import { verifyToken } from '../auth.service'
import { createTokenHash, createVfnPrefix, createVfnToken } from '../auth.util'

export const emailSessionRouter = router({
  // Generate OTP.
  login: publicProcedure
    .input(emailSignInSchema)
    .mutation(async ({ ctx, input: { email } }) => {
      // TODO: instead of storing expires, store issuedAt to calculate when the next otp can be re-issued
      // TODO: rate limit this endpoint also
      const expires = new TZDate(
        Date.now() + env.OTP_EXPIRY * 1000,
        'Asia/Singapore',
      )
      const token = createVfnToken()
      const otpPrefix = createVfnPrefix()
      const hashedToken = createTokenHash(token, email)

      const url = new URL(getBaseUrl())

      // May have one of them fail,
      // so users may get an email but not have the token saved, but that should be fine.
      await Promise.all([
        ctx.prisma.verificationToken.upsert({
          where: {
            identifier: email,
          },
          update: {
            token: hashedToken,
            expires,
            attempts: 0,
          },
          create: {
            identifier: email,
            token: hashedToken,
            expires,
          },
        }),
        sendMail({
          subject: `Sign in to ${url.host}`,
          body: `Your OTP is ${otpPrefix}-<b>${token}</b>. It will expire on ${format(
            expires,
            'dd MMM yyyy, h:mmaaa',
          )}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
          recipient: email,
        }),
      ])
      return { email, otpPrefix }
    }),
  verifyOtp: publicProcedure
    .input(emailVerifyOtpSchema)
    .mutation(async ({ ctx, input: { email, token } }) => {
      try {
        await verifyToken(ctx.prisma, {
          token,
          email,
        })
      } catch (e) {
        if (e instanceof VerificationError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: e.message,
            cause: e,
          })
        }
        throw e
      }

      const emailName = email.split('@')[0] ?? 'unknown'

      const user = await ctx.prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: emailName,
          },
          select: defaultMeSelect,
        })

        await tx.accounts.upsert({
          where: {
            provider_providerAccountId: {
              provider: AccountProvider.Email,
              providerAccountId: normaliseEmail.parse(email),
            },
          },
          update: {},
          create: {
            provider: AccountProvider.Email,
            providerAccountId: normaliseEmail.parse(email),
            userId: user.id,
          },
        })
        return user
      })

      ctx.session.userId = user.id
      await ctx.session.save()
      return user
    }),
})
