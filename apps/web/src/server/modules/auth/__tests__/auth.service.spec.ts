import '../../mail/__mocks__/mail.service'

import { resetTables } from '~tests/db/utils'
import { add } from 'date-fns/add'
import { mock } from 'vitest-mock-extended'

import { db } from '@acme/db'

import {
  ssCreatePkceChallenge,
  ssCreatePkceVerifier,
} from '~/lib/pkce/server-pkce'
import * as mailService from '../../mail/mail.service'
import { emailLogin, emailVerifyOtp } from '../auth.service'
import { createAuthToken, createVfnIdentifier } from '../auth.utils'

const mockedMailService = mock(mailService)

describe('auth.service', () => {
  beforeEach(async () => {
    await resetTables(['VerificationToken', 'User', 'Account'])
  })

  describe('emailLogin', () => {
    it('should create a verification token and send OTP email', async () => {
      const email = 'test@example.com'
      const codeChallenge = 'test-codeChallenge-123'

      const result = await emailLogin({ email, codeChallenge })

      expect(result).toEqual({
        email,
        token: expect.any(String),
        otpPrefix: expect.any(String),
      })

      // Verify token was created in database with vfnIdentifier
      const vfnIdentifier = createVfnIdentifier({ email, codeChallenge })
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

      await emailLogin({ email, codeChallenge: codeChallenge })

      await expect(
        emailLogin({ email, codeChallenge: codeChallenge }),
      ).rejects.toThrow('Please refresh and try again.')
    })

    it('should allow different codeChallenges for same email', async () => {
      const email = 'test@example.com'
      const codeChallenge1 = 'test-codeChallenge-1'
      const codeChallenge2 = 'test-codeChallenge-2'

      await emailLogin({ email, codeChallenge: codeChallenge1 })
      await emailLogin({ email, codeChallenge: codeChallenge2 })

      // Should have two records with different codeChallenges
      const vfnIdentifier1 = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge1,
      })
      const vfnIdentifier2 = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge2,
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

  describe('emailVerifyOtp', () => {
    it('should successfully verify a valid OTP', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)

      // Create a verification token
      const { token } = await emailLogin({ email, codeChallenge })

      // Should not throw
      await expect(
        emailVerifyOtp({ email, token, codeVerifier }),
      ).resolves.not.toThrow()

      // Token should be deleted after successful verification
      const vfnIdentifier = createVfnIdentifier({ email, codeChallenge })
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
      const { token } = await emailLogin({ email, codeChallenge })

      // Should throw
      await expect(
        emailVerifyOtp({ email, token, codeVerifier: wrongVerifier }),
      ).rejects.toThrow()
    })
    it('should throw error for non-existent codeChallenge', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const token = '123456'

      await expect(
        emailVerifyOtp({ email, token, codeVerifier }),
      ).rejects.toThrow()
    })

    it('should reject a wrong OTP with wrong codeVerifier', async () => {
      const email = 'test@example.com'
      const correctVerifier = ssCreatePkceVerifier()
      const correctCodeChallenge = ssCreatePkceChallenge(correctVerifier)

      const wrongVerifier = ssCreatePkceVerifier()

      // Create a verification token
      await emailLogin({ email, codeChallenge: correctCodeChallenge })

      const wrongToken = 'WRONG6'

      // Should throw
      await expect(
        emailVerifyOtp({
          email,
          token: wrongToken,
          codeVerifier: wrongVerifier,
        }),
      ).rejects.toThrow()
    })

    it('should reject a wrong OTP with correct codeVerifier', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const wrongToken = 'WRONG6'

      await emailLogin({ email, codeChallenge: codeChallenge })
      await expect(
        emailVerifyOtp({ email, token: wrongToken, codeVerifier }),
      ).rejects.toThrow('Token is invalid or has expired')
    })

    it('should reject an expired OTP with correct codeVerifier', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)

      const { token, hashedToken } = createAuthToken({
        email,
        codeChallenge: codeChallenge,
      })

      const vfnIdentifier = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge,
      })
      // Create a verification token with an old issuedAt date
      const oldDate = add(new Date(), { seconds: -700 }) // 700 seconds ago (beyond 600s expiry)
      await db.verificationToken.create({
        data: {
          identifier: vfnIdentifier,
          token: hashedToken,
          issuedAt: oldDate,
        },
      })

      await expect(
        emailVerifyOtp({ email, token, codeVerifier }),
      ).rejects.toThrow('Token is invalid or has expired')
    })

    it('should increment attempts on each verification try', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const wrongToken = 'WRONG6'

      await emailLogin({ email, codeChallenge: codeChallenge })
      const identifier = createVfnIdentifier({ email, codeChallenge })
      // Make 2 failed attempts
      for (let i = 1; i <= 2; i++) {
        await expect(
          emailVerifyOtp({ email, token: wrongToken, codeVerifier }),
        ).rejects.toThrow()
        const verificationToken = await db.verificationToken.findUnique({
          where: { identifier },
        })
        expect(verificationToken?.attempts).toBe(i)
      }
    })

    it('should reject after too many failed attempts (>5)', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const token = 'WRONG6'

      await emailLogin({ email, codeChallenge: codeChallenge })

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await expect(
          emailVerifyOtp({ email, token, codeVerifier }),
        ).rejects.toThrow()
      }

      // 6th attempt should give TOO_MANY_REQUESTS
      await expect(
        emailVerifyOtp({ email, token, codeVerifier }),
      ).rejects.toThrow('Wrong OTP was entered too many times')
    })

    it('should delete verification token after successful verification', async () => {
      const email = 'test@example.com'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const { token } = await emailLogin({ email, codeChallenge })

      await emailVerifyOtp({ email, token, codeVerifier })

      // Token should be deleted
      const vfnIdentifier = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge,
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
      const { token } = await emailLogin({ email, codeChallenge })

      // First verification succeeds
      await expect(
        emailVerifyOtp({ email, token, codeVerifier }),
      ).resolves.toBeDefined()

      // Second verification with same token should fail
      await expect(
        emailVerifyOtp({ email, token, codeVerifier }),
      ).rejects.toThrow()
    })
  })
})
