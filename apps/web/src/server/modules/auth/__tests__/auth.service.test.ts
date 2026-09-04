import { add } from 'date-fns/add'

import '../../mail/__mocks__/mail.service'
import { beforeEach, describe, expect, it } from 'vitest'
import { mock, mockDeep } from 'vitest-mock-extended'
import { resetTables } from '~tests/db/utils'

import type { Logger } from '@acme/logging'

import { db } from '@acme/db'

import * as mailService from '../../mail/mail.service'
import { emailLogin, emailVerifyOtp } from '../auth.service'
import { createAuthToken, createVfnIdentifier } from '../auth.utils'

import {
  ssCreatePkceChallenge,
  ssCreatePkceVerifier,
} from '~/lib/pkce/server-pkce'

const mockedMailService = mock(mailService)
const logger = mockDeep<Logger>()

const INVALID_OR_EXPIRED_MESSAGE = 'Token is invalid or has expired'
const WRONG_OTP_OR_REUSED_MESSAGE =
  'Wrong OTP entered or OTP already used, make sure to use the OTP that corresponds to the 3 character prefix.'

describe('auth.service', () => {
  beforeEach(async () => {
    await resetTables(['VerificationToken', 'User', 'Account'])
  })

  describe(emailLogin, () => {
    it('should create a verification token and send OTP email', async () => {
      const email = 'test@example.com'
      const codeChallenge = 'test-codeChallenge-123'

      const result = await emailLogin({ codeChallenge, email })

      expect(result).toStrictEqual({
        email,
        otpPrefix: expect.any(String),
        token: expect.any(String),
      })

      // Verify token was created in database with vfnIdentifier
      const vfnIdentifier = createVfnIdentifier({ codeChallenge, email })
      const token = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier },
      })
      expect(token).toBeDefined()
      expect(mockedMailService.sendMail).toHaveBeenCalledWith({
        body: expect.any(String),
        recipient: email,
        subject: expect.stringContaining('Sign in to '),
      })
    })

    it('should throw when code challenge is reused', async () => {
      const email = 'test@example.com'
      const codeChallenge = 'test-codeChallenge-123'

      await emailLogin({ codeChallenge, email })

      await expect(emailLogin({ codeChallenge, email })).rejects.toThrow(
        'Please refresh and try again.'
      )
    })

    it('should allow different codeChallenges for same email', async () => {
      const email = 'test@example.com'
      const codeChallenge1 = 'test-codeChallenge-1'
      const codeChallenge2 = 'test-codeChallenge-2'

      await emailLogin({ codeChallenge: codeChallenge1, email })
      await emailLogin({ codeChallenge: codeChallenge2, email })

      // Should have two records with different codeChallenges
      const vfnIdentifier1 = createVfnIdentifier({
        codeChallenge: codeChallenge1,
        email,
      })
      const vfnIdentifier2 = createVfnIdentifier({
        codeChallenge: codeChallenge2,
        email,
      })
      const token1 = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier1 },
      })
      const token2 = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier2 },
      })

      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1?.token).not.toBe(token2?.token)
    })
  })

  describe(emailVerifyOtp, () => {
    it('should successfully verify a valid OTP', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)

      // Create a verification token
      const { token } = await emailLogin({ codeChallenge, email })

      // Should not throw
      await expect(
        emailVerifyOtp({ codeVerifier, email, logger, token })
      ).resolves.not.toThrow()

      // Token should be deleted after successful verification
      const vfnIdentifier = createVfnIdentifier({ codeChallenge, email })
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier },
      })
      expect(verificationToken).toBeNull()
    })

    it('should reject a correct OTP with wrong codeVerifier', async () => {
      const email = 'test@example.com'
      const correctVerifier = ssCreatePkceVerifier()
      const wrongVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(correctVerifier)

      // Create a verification token
      const { token } = await emailLogin({ codeChallenge, email })

      // Should throw
      await expect(
        emailVerifyOtp({ codeVerifier: wrongVerifier, email, logger, token })
      ).rejects.toThrow(WRONG_OTP_OR_REUSED_MESSAGE)
    })

    it('should throw error for non-existent codeChallenge', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const token = '123456'

      await expect(
        emailVerifyOtp({ codeVerifier, email, logger, token })
      ).rejects.toThrow(WRONG_OTP_OR_REUSED_MESSAGE)
    })

    it('should reject a wrong OTP with wrong codeVerifier', async () => {
      const email = 'test@example.com'
      const correctVerifier = ssCreatePkceVerifier()
      const correctCodeChallenge = ssCreatePkceChallenge(correctVerifier)

      const wrongVerifier = ssCreatePkceVerifier()

      // Create a verification token
      await emailLogin({ codeChallenge: correctCodeChallenge, email })

      const wrongToken = 'WRONG6'

      // Should throw
      await expect(
        emailVerifyOtp({
          codeVerifier: wrongVerifier,
          email,
          logger,
          token: wrongToken,
        })
      ).rejects.toThrow(WRONG_OTP_OR_REUSED_MESSAGE)
    })

    it('should reject a wrong OTP with correct codeVerifier', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const wrongToken = 'WRONG6'

      await emailLogin({ codeChallenge, email })
      await expect(
        emailVerifyOtp({ codeVerifier, email, logger, token: wrongToken })
      ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
    })

    it('should reject an expired OTP with correct codeVerifier', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)

      const { token, hashedToken } = createAuthToken({
        codeChallenge,
        email,
      })

      const vfnIdentifier = createVfnIdentifier({
        codeChallenge,
        email,
      })
      // Create a verification token with an old issuedAt date
      // 700 seconds ago (beyond 600s expiry)
      const oldDate = add(new Date(), { seconds: -700 })
      await db.verificationToken.create({
        data: {
          identifier: vfnIdentifier,
          issuedAt: oldDate,
          token: hashedToken,
        },
      })

      await expect(
        emailVerifyOtp({ codeVerifier, email, logger, token })
      ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
    })

    it('should increment attempts on each verification try', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const wrongToken = 'WRONG6'

      await emailLogin({ codeChallenge, email })
      const identifier = createVfnIdentifier({ codeChallenge, email })

      const verifyAndAssertAttempts = async (attempt: number) => {
        await expect(
          emailVerifyOtp({ codeVerifier, email, logger, token: wrongToken })
        ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
        const verificationToken = await db.verificationToken.findUnique({
          where: { identifier },
        })
        expect(verificationToken?.attempts).toBe(attempt)
      }

      await verifyAndAssertAttempts(1)
      await verifyAndAssertAttempts(2)
    })

    it('should reject after too many failed attempts (>5)', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const token = 'WRONG6'

      await emailLogin({ codeChallenge, email })

      const verifyWrongOtp = async () => {
        await expect(
          emailVerifyOtp({ codeVerifier, email, logger, token })
        ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
      }

      await verifyWrongOtp()
      await verifyWrongOtp()
      await verifyWrongOtp()
      await verifyWrongOtp()
      await verifyWrongOtp()

      // 6th attempt should give TOO_MANY_REQUESTS
      await expect(
        emailVerifyOtp({ codeVerifier, email, logger, token })
      ).rejects.toThrow('Wrong OTP was entered too many times')
    })

    it('should delete verification token after successful verification', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const { token } = await emailLogin({ codeChallenge, email })

      await emailVerifyOtp({ codeVerifier, email, logger, token })

      // Token should be deleted
      const vfnIdentifier = createVfnIdentifier({
        codeChallenge,
        email,
      })
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier },
      })
      expect(verificationToken).toBeNull()
    })

    it('should prevent token reuse after successful verification', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const { token } = await emailLogin({ codeChallenge, email })

      // First verification succeeds
      await expect(
        emailVerifyOtp({ codeVerifier, email, logger, token })
      ).resolves.toBeDefined()

      // Second verification with same token should fail
      await expect(
        emailVerifyOtp({ codeVerifier, email, logger, token })
      ).rejects.toThrow(WRONG_OTP_OR_REUSED_MESSAGE)
    })
  })
})
