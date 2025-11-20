import '../../mail/__mocks__/mail.service'

import { resetTables } from '~tests/db/utils'
import { add } from 'date-fns/add'
import { mock } from 'vitest-mock-extended'

import { db } from '@acme/db'

import * as mailService from '../../mail/mail.service'
import { emailLogin, emailVerifyOtp } from '../auth.service'
import { createAuthToken } from '../auth.utils'

const mockedMailService = mock(mailService)

describe('auth.service', () => {
  beforeEach(async () => {
    await resetTables(['VerificationToken', 'User', 'Account'])
  })

  describe('emailLogin', () => {
    it('should create a verification token and send OTP email', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'

      const result = await emailLogin({ email, nonce })

      expect(result).toEqual({
        email,
        token: expect.any(String),
        otpPrefix: expect.any(String),
      })

      // Verify token was created in database with nonce as identifier
      const token = await db.verificationToken.findUnique({
        where: { identifier: nonce },
      })
      expect(token).toBeDefined()
      expect(mockedMailService.sendMail).toHaveBeenCalledWith({
        body: expect.any(String),
        recipient: email,
        subject: expect.stringContaining('Sign in to '),
      })
    })

    it('should reset attempts when sending new OTP for existing nonce', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'

      // First login
      await emailLogin({ email, nonce })

      // Simulate failed attempts
      await db.verificationToken.update({
        where: { identifier: nonce },
        data: { attempts: 3 },
      })

      // Second login should reset attempts
      await emailLogin({ email, nonce })

      const token = await db.verificationToken.findUnique({
        where: { identifier: nonce },
      })
      expect(token?.attempts).toBe(0)
    })

    it('should update existing token instead of creating duplicate for same nonce', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'

      await emailLogin({ email, nonce })
      await emailLogin({ email, nonce })

      // Should only have one record
      const tokens = await db.verificationToken.findMany({
        where: { identifier: nonce },
      })
      expect(tokens).toHaveLength(1)
    })

    it('should allow different nonces for same email', async () => {
      const email = 'test@example.com'
      const nonce1 = 'test-nonce-1'
      const nonce2 = 'test-nonce-2'

      await emailLogin({ email, nonce: nonce1 })
      await emailLogin({ email, nonce: nonce2 })

      // Should have two records with different nonces
      const token1 = await db.verificationToken.findUnique({
        where: { identifier: nonce1 },
      })
      const token2 = await db.verificationToken.findUnique({
        where: { identifier: nonce2 },
      })

      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1?.token).not.toBe(token2?.token)
    })
  })

  describe('emailVerifyOtp', () => {
    it('should successfully verify a valid OTP', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'

      // Create a verification token
      const { token } = await emailLogin({ email, nonce })

      // Should not throw
      await expect(
        emailVerifyOtp({ email, token, nonce }),
      ).resolves.not.toThrow()

      // Token should be deleted after successful verification
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: nonce },
      })
      expect(verificationToken).toBeNull()
    })

    it('should reject an invalid OTP', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'
      const token = 'WRONG6'

      await emailLogin({ email, nonce })
      await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow(
        'Token is invalid or has expired',
      )
    })

    it('should reject an expired OTP', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'

      const { token, hashedToken } = createAuthToken({ email, nonce })

      // Create a verification token with an old issuedAt date
      const oldDate = add(new Date(), { seconds: -700 }) // 700 seconds ago (beyond 600s expiry)
      await db.verificationToken.create({
        data: {
          identifier: nonce,
          token: hashedToken,
          issuedAt: oldDate,
        },
      })

      await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow(
        'Token is invalid or has expired',
      )
    })

    it('should increment attempts on each verification try', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'
      const token = 'WRONG6'

      await emailLogin({ email, nonce })

      // First attempt
      await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow()
      let verificationToken = await db.verificationToken.findUnique({
        where: { identifier: nonce },
      })
      expect(verificationToken?.attempts).toBe(1)

      // Second attempt
      await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow()
      verificationToken = await db.verificationToken.findUnique({
        where: { identifier: nonce },
      })
      expect(verificationToken?.attempts).toBe(2)
    })

    it('should reject after too many failed attempts (>5)', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'
      const token = 'WRONG6'

      await emailLogin({ email, nonce })

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow()
      }

      // 6th attempt should give TOO_MANY_REQUESTS
      await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow(
        'Wrong OTP was entered too many times',
      )
    })

    it('should throw error for non-existent nonce', async () => {
      const email = 'test@example.com'
      const nonce = 'nonexistent-nonce'
      const token = '123456'

      await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow(
        'Invalid login email or missing nonce',
      )
    })

    it('should delete verification token after successful verification', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'
      const { token } = await emailLogin({ email, nonce })

      await emailVerifyOtp({ email, token, nonce })

      // Token should be deleted
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: nonce },
      })
      expect(verificationToken).toBeNull()
    })

    it('should prevent token reuse after successful verification', async () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'
      const { token } = await emailLogin({ email, nonce })

      // First verification succeeds
      await expect(
        emailVerifyOtp({ email, token, nonce }),
      ).resolves.toBeDefined()

      // Second verification with same token should fail
      await expect(emailVerifyOtp({ email, token, nonce })).rejects.toThrow(
        'Invalid login email or missing nonce',
      )
    })

    it('should not allow using token with wrong nonce', async () => {
      const email = 'test@example.com'
      const nonce1 = 'test-nonce-1'
      const nonce2 = 'test-nonce-2'

      const { token } = await emailLogin({ email, nonce: nonce1 })

      // Try to verify with wrong nonce
      await expect(
        emailVerifyOtp({ email, token, nonce: nonce2 }),
      ).rejects.toThrow('Invalid login email or missing nonce')

      // Original token should still exist
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: nonce1 },
      })
      expect(verificationToken).toBeDefined()
    })

    it('should ensure OTP is tied to specific session via nonce', async () => {
      const email = 'test@example.com'
      const nonce1 = 'session-1-nonce'
      const nonce2 = 'session-2-nonce'

      // Two different sessions for same email
      const { token: token1 } = await emailLogin({ email, nonce: nonce1 })
      const { token: token2 } = await emailLogin({ email, nonce: nonce2 })

      // Each token should only work with its own nonce
      await expect(
        emailVerifyOtp({ email, token: token1, nonce: nonce1 }),
      ).resolves.toBeDefined()

      // token2 with nonce2 should still work (not affected by token1 verification)
      await expect(
        emailVerifyOtp({ email, token: token2, nonce: nonce2 }),
      ).resolves.toBeDefined()
    })
  })
})
