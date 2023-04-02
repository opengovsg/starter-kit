import { publicProcedure, router } from 'src/server/trpc'
import { z } from 'zod'
import { sendMail } from '~/lib/mail'
import { env } from '~/server/env'
import { getBaseUrl } from '~/utils/getBaseUrl'

import { TRPCError } from '@trpc/server'
import {
  createTokenHash,
  createVfnToken,
} from '~/server/modules/auth/auth.utils'
import { useVerificationToken } from '~/server/modules/auth/auth.service'
import { VerificationError } from '~/server/modules/auth/auth.errors'
import { defaultUserSelect } from '~/server/modules/user/user.select'

export const emailSessionRouter = router({
  // Generate OTP.
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input: { email } }) => {
      const expires = new Date(Date.now() + env.OTP_EXPIRY * 1000)
      const token = createVfnToken()
      const hashedToken = createTokenHash(token)

      const url = new URL(getBaseUrl())

      // May have one of them fail,
      // so users may get an email but not have the token saved, but that should be fine.
      await Promise.all([
        ctx.prisma.verificationToken.create({
          data: {
            identifier: email,
            token: hashedToken,
            expires,
          },
        }),
        sendMail({
          subject: `Sign in to ${url.host}`,
          body: `Your OTP is <b>${token}</b>. It will expire on ${expires}.
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
      const invite = await useVerificationToken(ctx.prisma, {
        token: otp,
        email,
      })
      const hasInvite = !!invite
      const expired = invite ? invite.expires.valueOf() < Date.now() : undefined
      const invalidInvite = !hasInvite || expired
      if (invalidInvite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'OTP is invalid or expired.',
          cause: new VerificationError({ hasInvite, expired }),
        })
      }

      const user = await ctx.prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          emailVerified: new Date(),
        },
        select: defaultUserSelect,
      })

      // Sign user in.
      ctx.session.user = user

      await ctx.session.save()
      return user
    }),
})
