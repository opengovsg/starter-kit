import { TRPCError } from '@trpc/server'
import { add } from 'date-fns/add'

import type { Logger } from '@acme/logging'

import { db } from '@acme/db'

import { isValidToken } from './auth-token'
import { createVfnIdentifier } from './vfn'

import { Prisma } from '@acme/db/client'
import { env } from '~/env'
import { ssCreatePkceChallenge } from '~/lib/pkce/server-pkce'

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
}) => {
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
      !isValidToken({ codeChallenge, email, hash: hashedToken.token, token })
    ) {
      logger.audit.authn.loginFailed({
        attemptCount: hashedToken.attempts,
        privileged: true,
        reason: hasExpired ? 'otp_expired' : 'otp_invalid',
        username: email,
      })
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Token is invalid or has expired. Please request a new OTP.',
      })
    }

    // NOTE: You can also use `kysely` for your queries
    // if you want more fine-grained control.
    // Valid token, delete record to prevent reuse
    return await db.$kysely
      .deleteFrom('VerificationToken')
      .where('identifier', '=', vfnIdentifier)
      .returningAll()
      .executeTakeFirstOrThrow(
        // NOTE: If we are unable to find the token,
        // this means that it has been deleted between
        // our initial query and the deletion here
        () =>
          new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Token is invalid or has expired. Please request a new OTP.',
          })
      )
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
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Wrong OTP entered or OTP already used, make sure to use the OTP that corresponds to the 3 character prefix.',
      })
    }

    throw error
  }
}
