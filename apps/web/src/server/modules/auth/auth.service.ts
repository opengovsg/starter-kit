import { add } from 'date-fns/add'
import { format } from 'date-fns/format'

import type { Logger } from '@acme/logging'

import { db } from '@acme/db'

import { sendMail } from '../mail/mail.service'
import type { EmailLoginResult, OtpVerifyResult } from './auth.results'
import {
  createAuthToken,
  createVfnIdentifier,
  createVfnPrefix,
  isValidToken,
} from './auth.utils'

import { Prisma } from '@acme/db/client'
import { env } from '~/env'
import { ssCreatePkceChallenge } from '~/lib/pkce/server-pkce'
import { getBaseUrl } from '~/utils/get-base-url'

export const emailLogin = async ({
  email,
  codeChallenge,
}: {
  email: string
  codeChallenge: string
}): Promise<EmailLoginResult> => {
  const identifier = createVfnIdentifier({ codeChallenge, email })
  const { token, hashedToken } = createAuthToken({ codeChallenge, email })

  let issuedAt: Date

  try {
    ;({ issuedAt } = await db.verificationToken.create({
      data: {
        identifier,
        issuedAt: new Date(),
        token: hashedToken,
      },
      select: {
        issuedAt: true,
      },
    }))
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // P2025 cant happen currently because there is no relation on verificationToken table
      // That means a duplicate code challenge was used with the same email
      return { status: 'duplicate_challenge' }
    }

    throw error
  }

  const url = new URL(getBaseUrl())
  // for frontend display purposes: helps user to match OTP to session
  const otpPrefix = createVfnPrefix()
  const expiry = add(issuedAt, { seconds: env.OTP_EXPIRY })
  await sendMail({
    body: `Your OTP is ${otpPrefix}-<b>${token}</b>. It will expire on ${format(
      expiry,
      'dd MMM yyyy, h:mmaaa'
    )}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
    recipient: email,
    subject: `Sign in to ${url.host}`,
  })

  // return email if you want to send the OTP to a different email
  return {
    email,
    otpPrefix,
    status: 'sent',
    token,
  }
}

export const emailVerifyOtp = async ({
  email,
  token,
  codeVerifier,
  logger,
}: {
  email: string
  token: string
  codeVerifier: string
  logger: Logger
}): Promise<OtpVerifyResult> => {
  const codeChallenge = ssCreatePkceChallenge(codeVerifier)
  const vfnIdentifier = createVfnIdentifier({ codeChallenge, email })

  try {
    // Not in transaction, because we do not want it to rollback
    const hashedToken = await db.verificationToken.update({
      data: {
        attempts: {
          increment: 1,
        },
      },
      where: {
        identifier: vfnIdentifier,
      },
    })

    if (hashedToken.attempts > 5) {
      logger.audit.authn.loginFailed({
        attemptCount: hashedToken.attempts,
        privileged: true,
        reason: 'too_many_attempts',
        username: email,
      })

      return { attempts: hashedToken.attempts, status: 'locked' }
    }

    // Expired
    const hasExpired =
      add(hashedToken.issuedAt, { seconds: env.OTP_EXPIRY }) < new Date()

    if (
      hasExpired ||
      !isValidToken({ codeChallenge, email, hash: hashedToken.token, token })
    ) {
      logger.audit.authn.loginFailed({
        attemptCount: hashedToken.attempts,
        privileged: true,
        reason: hasExpired ? 'otp_expired' : 'otp_invalid',
        username: email,
      })

      return { status: hasExpired ? 'expired' : 'invalid' }
    }

    // NOTE: You can also use `kysely` for your queries
    // if you want more fine-grained control.
    // Valid token, delete record to prevent reuse.
    // A missing row means it was deleted between the increment and this delete.
    const deleted = await db.$kysely
      .deleteFrom('VerificationToken')
      .where('identifier', '=', vfnIdentifier)
      .returningAll()
      .executeTakeFirst()

    if (deleted === undefined) {
      return { status: 'consumed' }
    }

    return { status: 'verified' }
  } catch (error) {
    // see error code here: https://www.prisma.io/docs/orm/reference/error-reference#p2025
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // The codeChallenge does not exist: the OTP was used on a different
      // session than it was generated for, or it is being replayed.
      logger.audit.authn.tokenReused({
        context: { email },
        tokenId: codeChallenge,
      })

      return { status: 'reused' }
    }

    throw error
  }
}
