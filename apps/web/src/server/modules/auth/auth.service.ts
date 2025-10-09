import { TRPCError } from '@trpc/server'
import { add } from 'date-fns/add'
import { format } from 'date-fns/format'

import { db, Prisma } from '@acme/db'

import { env } from '~/env'
import { getBaseUrl } from '~/utils/get-base-url'
import { sendMail } from '../mail/mail.service'
import { createAuthToken, createVfnPrefix, isValidToken } from './auth.utils'

export const emailLogin = async (email: string) => {
  const { token, hashedToken } = createAuthToken(email)
  const otpPrefix = createVfnPrefix()

  const url = new URL(getBaseUrl())

  const { issuedAt } = await db.verificationToken.upsert({
    where: {
      identifier: email,
    },
    update: {
      token: hashedToken,
      attempts: 0,
    },
    create: {
      identifier: email,
      token: hashedToken,
    },
    select: {
      issuedAt: true,
    },
  })

  const expiry = add(issuedAt, { seconds: env.OTP_EXPIRY })
  await sendMail({
    subject: `Sign in to ${url.host}`,
    body: `Your OTP is ${otpPrefix}-<b>${token}</b>. It will expire on ${format(
      expiry,
      'dd MMM yyyy, h:mmaaa',
    )}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
    recipient: email,
  })

  return {
    email,
    otpPrefix,
  }
}

export const emailVerifyOtp = async ({
  email,
  token,
}: {
  email: string
  token: string
}) => {
  try {
    await db.$transaction(async (tx) => {
      const hashedToken = await tx.verificationToken.update({
        where: {
          identifier: email,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      })

      if (hashedToken.attempts > 5) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message:
            'Wrong OTP was entered too many times. Please request a new OTP.',
        })
      }

      // Expired
      const hasExpired =
        add(hashedToken.issuedAt, { seconds: env.OTP_EXPIRY }) < new Date()
      if (
        hasExpired ||
        !isValidToken({ token, email, hash: hashedToken.token })
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Token is invalid or has expired. Please request a new OTP.',
        })
      }

      // Valid token, delete record to prevent reuse
      return tx.verificationToken.delete({
        where: {
          identifier: email,
        },
      })
    })
  } catch (error) {
    // see error code here: https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid login email',
      })
    }
    throw error
  }
}
