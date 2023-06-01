import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '~/server/trpc'
import { sendMail } from '~/lib/mail'
import { getBaseUrl } from '~/utils/getBaseUrl'
import { defaultUserSelect } from '~/server/modules/user/user.select'
import { createTokenHash, createVfnToken } from '../auth.util'
import { verifyToken } from '../auth.service'
import { VerificationError } from '../auth.error'
import { set } from 'lodash'
import { env } from '~/env.mjs'
import { formatInTimeZone } from 'date-fns-tz'

export const emailSessionRouter = router({
  // Generate OTP.
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input: { email } }) => {
      // TODO: instead of storing expires, store issuedAt to calculate when the next otp can be re-issued
      // TODO: rate limit this endpoint also
      const expires = new Date(Date.now() + env.OTP_EXPIRY * 1000)
      const token = createVfnToken()
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
          body: `Your OTP is <b>${token}</b>. It will expire on ${formatInTimeZone(
            expires,
            'Asia/Singapore',
            'dd MMM yyyy, hh:mmaaa'
          )}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
          recipient: email,
        }),
      ])
      return email
    }),
  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input: { email, otp } }) => {
      try {
        await verifyToken(ctx.prisma, {
          token: otp,
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

      const user = await ctx.prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          emailVerified: new Date(),
          name: email.split('@')[0],
        },
        select: defaultUserSelect,
      })

      // TODO: Should only store user id in session.
      // The rest of user details should be fetched from db in protectedProcedure.
      // Sign user in.
      set(ctx, 'session.user', user)

      await ctx.session?.save()
      return user
    }),
})
