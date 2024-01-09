import {
  applySession,
  createMockRequest,
} from 'tests/integration/helpers/iron-session'
import { it, expect, describe } from 'vitest'
import { env } from '~/env.mjs'
import * as mailLib from '~/lib/mail'
import { prisma } from '~/server/prisma'
import { createTokenHash } from '../../auth.util'
import { emailSessionRouter } from '../email.router'

describe('auth.email', async () => {
  let caller: Awaited<ReturnType<typeof emailSessionRouter.createCaller>>
  let session: ReturnType<typeof applySession>

  beforeEach(async () => {
    session = applySession()
    const ctx = await createMockRequest(session)
    caller = emailSessionRouter.createCaller(ctx)
  })

  describe('login', async () => {
    const TEST_VALID_EMAIL = 'test@open.gov.sg'
    it('should throw if email is not provided', async () => {
      // Act
      const result = caller.login({ email: '' })

      // Assert
      await expect(result).rejects.toThrowError()
    })

    it('should throw if email is invalid', async () => {
      // Act
      const result = caller.login({ email: 'not-an-email' })

      // Assert
      await expect(result).rejects.toThrowError()
    })

    it('should throw if email is not a government email address', async () => {
      // Act
      const result = caller.login({ email: 'validbutnotgovt@example.com' })

      // Assert
      await expect(result).rejects.toThrowError()
    })

    it('should return email and a prefix if OTP is sent successfully', async () => {
      // Arrange
      const spy = vi.spyOn(mailLib, 'sendMail')

      // Act
      const result = await caller.login({ email: TEST_VALID_EMAIL })

      // Assert
      const expectedReturn = {
        email: TEST_VALID_EMAIL,
        otpPrefix: expect.any(String),
      }
      expect(spy).toHaveBeenCalledWith({
        body: expect.stringContaining('Your OTP is'),
        recipient: TEST_VALID_EMAIL,
        subject: expect.stringContaining('Sign in to'),
      })
      expect(result).toEqual(expectedReturn)
    })
  })

  describe('verifyOtp', () => {
    const TEST_VALID_EMAIL = 'test@open.gov.sg'
    const VALID_OTP = '123456'
    const VALID_TOKEN_HASH = createTokenHash(VALID_OTP, TEST_VALID_EMAIL)
    const INVALID_OTP = '987643'

    it('should successfully set session on valid OTP', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() + env.OTP_EXPIRY * 1000),
          identifier: TEST_VALID_EMAIL,
          token: VALID_TOKEN_HASH,
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_VALID_EMAIL,
        token: VALID_OTP,
      })

      // Assert
      const expectedUser = {
        id: expect.any(String),
        email: TEST_VALID_EMAIL,
      }
      // Should return logged in user.
      await expect(result).resolves.toMatchObject(expectedUser)
      // Session should have been set with logged in user.
      expect(session.userId).toEqual(expectedUser.id)
    })

    it('should throw if OTP is not found', async () => {
      // Act
      const result = caller.verifyOtp({
        email: TEST_VALID_EMAIL,
        // Not created yet.
        token: INVALID_OTP,
      })

      // Assert
      await expect(result).rejects.toThrowError('Invalid login email')
    })

    it('should throw if OTP is invalid', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() + env.OTP_EXPIRY * 1000),
          identifier: TEST_VALID_EMAIL,
          token: VALID_TOKEN_HASH,
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_VALID_EMAIL,
        // OTP does not match email record.
        token: INVALID_OTP,
      })

      // Assert
      await expect(result).rejects.toThrowError(
        'Token is invalid or has expired',
      )
    })

    it('should throw if OTP is expired', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() - 1000),
          identifier: TEST_VALID_EMAIL,
          token: VALID_TOKEN_HASH,
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_VALID_EMAIL,
        token: VALID_OTP,
      })

      // Assert
      await expect(result).rejects.toThrowError(
        'Token is invalid or has expired',
      )
    })

    it('should throw if max verification attempts has been reached', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() + env.OTP_EXPIRY * 1000),
          identifier: TEST_VALID_EMAIL,
          token: VALID_TOKEN_HASH,
          attempts: 6, // Currently hardcoded to 5 attempts.
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_VALID_EMAIL,
        token: VALID_OTP,
      })

      // Assert
      await expect(result).rejects.toThrowError('Too many attempts')
    })
  })
})
