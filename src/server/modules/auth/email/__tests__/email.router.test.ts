import { applySession } from 'tests/integration/helpers/iron-session'
import { it, expect, describe } from 'vitest'
import { env } from '~/env.mjs'
import * as mailLib from '~/lib/mail'
import { createContextInner } from '~/server/context'
import { prisma } from '~/server/prisma'
import { createTokenHash } from '../../auth.util'
import { emailSessionRouter } from '../email.router'

describe('auth.email', async () => {
  let caller: Awaited<ReturnType<typeof emailSessionRouter.createCaller>>
  let session: ReturnType<typeof applySession>

  beforeEach(async () => {
    session = applySession()
    const ctx = await createContextInner({ session })
    caller = emailSessionRouter.createCaller(ctx)
  })

  describe('login', async () => {
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

    it('should return email if OTP is sent successfully', async () => {
      // Arrange
      const spy = vi.spyOn(mailLib, 'sendMail')

      // Act
      const expectedReturn = 'test@example.com'
      const result = await caller.login({ email: expectedReturn })

      // Assert
      expect(spy).toHaveBeenCalledWith({
        body: expect.stringContaining('Your OTP is'),
        recipient: expectedReturn,
        subject: expect.stringContaining('Sign in to'),
      })
      expect(result).toEqual(expectedReturn)
    })
  })

  describe('verifyOtp', () => {
    const TEST_EMAIL = 'test@example.com'
    const VALID_OTP = '123456'
    const VALID_TOKEN_HASH = createTokenHash(VALID_OTP, TEST_EMAIL)

    it('should successfully set session on valid OTP', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() + env.OTP_EXPIRY * 1000),
          identifier: TEST_EMAIL,
          token: VALID_TOKEN_HASH,
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_EMAIL,
        otp: VALID_OTP,
      })

      // Assert
      const expectedUser = {
        id: expect.any(String),
        email: TEST_EMAIL,
      }
      // Should return logged in user.
      await expect(result).resolves.toMatchObject(expectedUser)
      // Session should have been set with logged in user.
      expect(session.user).toMatchObject(expectedUser)
    })

    it('should throw if OTP is not found', async () => {
      // Act
      const result = caller.verifyOtp({
        email: TEST_EMAIL,
        // Not created yet.
        otp: '987643',
      })

      // Assert
      await expect(result).rejects.toThrowError('Invalid login email')
    })

    it('should throw if OTP is invalid', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() + env.OTP_EXPIRY * 1000),
          identifier: TEST_EMAIL,
          token: createTokenHash('invalid-otp', TEST_EMAIL),
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_EMAIL,
        // OTP does not match email record.
        otp: '987643',
      })

      // Assert
      await expect(result).rejects.toThrowError(
        'Token is invalid or has expired'
      )
    })

    it('should throw if OTP is expired', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() - 1000),
          identifier: TEST_EMAIL,
          token: VALID_TOKEN_HASH,
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_EMAIL,
        otp: VALID_OTP,
      })

      // Assert
      await expect(result).rejects.toThrowError(
        'Token is invalid or has expired'
      )
    })

    it('should throw if max verification attempts has been reached', async () => {
      // Arrange
      await prisma.verificationToken.create({
        data: {
          expires: new Date(Date.now() + env.OTP_EXPIRY * 1000),
          identifier: TEST_EMAIL,
          token: VALID_TOKEN_HASH,
          attempts: 6, // Currently hardcoded to 5 attempts.
        },
      })

      // Act
      const result = caller.verifyOtp({
        email: TEST_EMAIL,
        otp: VALID_OTP,
      })

      // Assert
      await expect(result).rejects.toThrowError('Too many attempts')
    })
  })
})
