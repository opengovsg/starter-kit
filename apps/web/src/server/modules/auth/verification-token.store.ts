import type { VerificationTokenStore } from '@opengovsg/auth/server/otp'

import { db } from '@acme/db'

import { Prisma } from '@acme/db/client'

/**
 * Prisma adapter for `@opengovsg/auth`'s OTP verification-token store.
 * All three methods are single atomic DB ops so attempt caps and one-time
 * use hold under concurrent requests.
 */
export const verificationTokenStore: VerificationTokenStore = {
  async create({ identifier, hashedToken, issuedAt }) {
    try {
      await db.verificationToken.create({
        data: { identifier, token: hashedToken, issuedAt },
      })
      return 'created'
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return 'conflict'
      }
      throw error
    }
  },

  async incrementAttempts(identifier) {
    try {
      const record = await db.verificationToken.update({
        where: { identifier },
        data: { attempts: { increment: 1 } },
      })
      return {
        hashedToken: record.token,
        attempts: record.attempts,
        issuedAt: record.issuedAt,
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null
      }
      throw error
    }
  },

  async consume(identifier, expectedHashedToken) {
    const { count } = await db.verificationToken.deleteMany({
      where: { identifier, token: expectedHashedToken },
    })
    return count > 0
  },
}
