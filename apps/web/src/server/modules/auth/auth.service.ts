import { TRPCError } from '@trpc/server'
import { add } from 'date-fns/add'
import { format } from 'date-fns/format'

import { db } from '@acme/db'
import { Prisma } from '@acme/db/client'

import { env } from '~/env'
import { getBaseUrl } from '~/utils/get-base-url'
import { sendMail } from '../mail/mail.service'
import {
  createAuthToken,
  createVfnIdentifier,
  createVfnPrefix,
  isValidToken,
} from './auth.utils'

export const emailLogin = async ({
  email,
  nonce,
}: {
  email: string
  nonce: string
}) => {
  const { token, hashedToken } = createAuthToken({ email, nonce })
  const otpPrefix = createVfnPrefix()

  const url = new URL(getBaseUrl())

  const vfnIdentifier = createVfnIdentifier({ email, nonce })

  const { issuedAt } = await db.verificationToken.upsert({
    where: {
      identifier: vfnIdentifier,
    },
    update: {
      token: hashedToken,
      attempts: 0,
      issuedAt: new Date(),
    },
    create: {
      identifier: vfnIdentifier,
      token: hashedToken,
      issuedAt: new Date(),
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
    token,
    email,
    otpPrefix,
  }
}

export const emailVerifyOtp = async ({
  email,
  token,
  nonce,
}: {
  email: string
  token: string
  nonce: string
}) => {
  const vfnIdentifier = createVfnIdentifier({ email, nonce })

  try {
    // Not in transaction, because we do not want it to rollback
    const hashedToken = await db.verificationToken.update({
      where: {
        identifier: vfnIdentifier,
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
      !isValidToken({ token, email, nonce, hash: hashedToken.token })
    ) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Token is invalid or has expired. Please request a new OTP.',
      })
    }

    // Valid token, delete record to prevent reuse
    return db.verificationToken.delete({
      where: {
        identifier: vfnIdentifier,
      },
    })
  } catch (error) {
    // see error code here: https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid login email or missing nonce',
      })
    }
    throw error
  }
}
