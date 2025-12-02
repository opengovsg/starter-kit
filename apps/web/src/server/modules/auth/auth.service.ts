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
import { createPkceChallenge } from "~/server/modules/auth/auth.pkce";

export const emailLogin = async ({
  email,
  codeChallenge,
}: {
  email: string
  codeChallenge: string
}) => {
  const identifier = createVfnIdentifier({ email, codeChallenge })
  const { token, hashedToken } = createAuthToken({ email, codeChallenge })

  let issuedAt: Date
  try {
    ({ issuedAt } = await db.verificationToken.create({
      data: {
        identifier,
        token: hashedToken,
        issuedAt: new Date(),
      },
      select: {
        issuedAt: true,
      },
    }))
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // That means a duplicate code challenge was with the same email
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Please refresh and try again.',
      })
    }
    throw error

  }


  const url = new URL(getBaseUrl())
  const otpPrefix = createVfnPrefix() // for frontend display purposes: helps user to match OTP to session
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

  // return email if you want to send the OTP to a different email
  return {
    token,
    email,
    otpPrefix,
  }
}

export const emailVerifyOtp = async ({
  email,
  token,
  codeVerifier,
}: {
  email: string
  token: string
  codeVerifier: string
}) => {
  const codeChallenge = createPkceChallenge(codeVerifier)
  const vfnIdentifier = createVfnIdentifier({ email, codeChallenge })

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
      !isValidToken({ token, email, codeChallenge, hash: hashedToken.token })
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
      // TODO: Log error, this means the codeChallenge does not exist
      // Likely the user used the OTP on a different session than the one it was generated for
      // Or user is trying to reuse an OTP
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Wrong OTP entered or OTP already used, make sure to use the OTP that corresponds to the 3 character prefix.',
      })
    }
    throw error
  }
}
