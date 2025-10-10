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
    await resetTables(['VerificationToken', 'User', 'Accounts'])
  })

  describe('emailLogin', () => {
    it('should create a verification token and send OTP email', async () => {
      const email = 'test@example.com'

      const result = await emailLogin(email)

      expect(result).toEqual({
        email,
        token: expect.any(String),
        otpPrefix: expect.any(String),
      })

      // Verify token was created in database
      const token = await db.verificationToken.findUnique({
        where: { identifier: email },
      })
      expect(token).toBeDefined()
      expect(mockedMailService.sendMail).toHaveBeenCalledWith({
        body: expect.any(String),
        recipient: email,
        subject: expect.stringContaining('Sign in to '),
      })
    })

    it('should reset attempts when sending new OTP for existing user', async () => {
      const email = 'test@example.com'

      // First login
      await emailLogin(email)

      // Simulate failed attempts
      await db.verificationToken.update({
        where: { identifier: email },
        data: { attempts: 3 },
      })

      // Second login should reset attempts
      await emailLogin(email)

      const token = await db.verificationToken.findUnique({
        where: { identifier: email },
      })
      expect(token?.attempts).toBe(0)
    })

    it('should update existing token instead of creating duplicate', async () => {
      const email = 'test@example.com'

      await emailLogin(email)
      await emailLogin(email)

      // Should only have one record
      const tokens = await db.verificationToken.findMany({
        where: { identifier: email },
      })
      expect(tokens).toHaveLength(1)
    })
  })

  describe('emailVerifyOtp', () => {
    it('should successfully verify a valid OTP', async () => {
      const email = 'test@example.com'

      // Create a verification token
      const { token } = await emailLogin(email)

      // Should not throw
      await expect(emailVerifyOtp({ email, token })).resolves.not.toThrow()

      // Token should be deleted after successful verification
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: email },
      })
      expect(verificationToken).toBeNull()
    })

    it('should reject an invalid OTP', async () => {
      const email = 'test@example.com'
      const token = 'WRONG6'

      await emailLogin(email)
      await expect(emailVerifyOtp({ email, token })).rejects.toThrow(
        'Token is invalid or has expired',
      )
    })

    it('should reject an expired OTP', async () => {
      const email = 'test@example.com'

      const { token, hashedToken } = createAuthToken(email)

      // Create a verification token with an old issuedAt date
      const oldDate = add(new Date(), { seconds: -700 }) // 700 seconds ago (beyond 600s expiry)
      await db.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken,
          issuedAt: oldDate,
        },
      })

      await expect(emailVerifyOtp({ email, token })).rejects.toThrow(
        'Token is invalid or has expired',
      )
    })

    it('should increment attempts on each verification try', async () => {
      const email = 'test@example.com'
      const token = 'WRONG6'

      await emailLogin(email)

      // First attempt
      await expect(emailVerifyOtp({ email, token })).rejects.toThrow()
      let verificationToken = await db.verificationToken.findUnique({
        where: { identifier: email },
      })
      expect(verificationToken?.attempts).toBe(1)

      // Second attempt
      await expect(emailVerifyOtp({ email, token })).rejects.toThrow()
      verificationToken = await db.verificationToken.findUnique({
        where: { identifier: email },
      })
      expect(verificationToken?.attempts).toBe(2)
    })

    it('should reject after too many failed attempts (>5)', async () => {
      const email = 'test@example.com'
      const token = 'WRONG6'

      await emailLogin(email)

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await expect(emailVerifyOtp({ email, token })).rejects.toThrow()
      }

      // 6th attempt should give TOO_MANY_REQUESTS
      await expect(emailVerifyOtp({ email, token })).rejects.toThrow(
        'Wrong OTP was entered too many times',
      )
    })

    it('should throw UNAUTHORIZED error for non-existent email', async () => {
      const email = 'nonexistent@example.com'
      const token = '123456'

      await expect(emailVerifyOtp({ email, token })).rejects.toThrow(
        'Invalid login email',
      )
    })

    it('should delete verification token after successful verification', async () => {
      // Arrange
      const email = 'test@example.com'
      const { token } = await emailLogin(email)

      // Act
      await emailVerifyOtp({ email, token })

      // Assert
      // Token should be deleted
      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: email },
      })
      expect(verificationToken).toBeNull()
    })

    it('should prevent token reuse after successful verification', async () => {
      // Arrange
      const email = 'test@example.com'
      const { token } = await emailLogin(email)

      // Act
      // First verification succeeds
      await expect(emailVerifyOtp({ email, token })).resolves.toBeDefined()

      // Assert
      // Second verification with same token should fail
      await expect(emailVerifyOtp({ email, token })).rejects.toThrow(
        'Invalid login email',
      )
    })
  })
})
