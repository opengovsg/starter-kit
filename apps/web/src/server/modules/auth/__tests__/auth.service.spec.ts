import { add } from 'date-fns/add'
import { format } from 'date-fns/format'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from '@acme/db'

import { env } from '~/env'
import { getBaseUrl } from '~/utils/get-base-url'
import { sendMail } from '../../mail/mail.service'
import { emailLogin } from '../auth.service'
import { createAuthToken, createVfnPrefix } from '../auth.utils'

// Mock dependencies
vi.mock('@acme/db', () => ({
  db: {
    verificationToken: {
      upsert: vi.fn(),
    },
  },
}))

vi.mock('~/env', () => ({
  env: {
    OTP_EXPIRY: 600,
  },
}))

vi.mock('~/utils/get-base-url', () => ({
  getBaseUrl: vi.fn(),
}))

vi.mock('../../mail/mail.service', () => ({
  sendMail: vi.fn(),
}))

vi.mock('../auth.utils', () => ({
  createAuthToken: vi.fn(),
  createVfnPrefix: vi.fn(),
}))

describe('auth.service', () => {
  const mockEmail = 'test@example.com'
  const mockToken = '123456'
  const mockHashedToken = 'hashed-token-123'
  const mockOtpPrefix = 'ABC'
  const mockBaseUrl = 'http://localhost:3000'
  const mockIssuedAt = new Date('2025-10-09T10:00:00Z')

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    vi.mocked(createAuthToken).mockReturnValue({
      token: mockToken,
      hashedToken: mockHashedToken,
    })

    vi.mocked(createVfnPrefix).mockReturnValue(mockOtpPrefix)
    vi.mocked(getBaseUrl).mockReturnValue(mockBaseUrl)

    vi.mocked(db.verificationToken.upsert).mockResolvedValue({
      identifier: mockEmail,
      token: mockHashedToken,
      attempts: 0,
      issuedAt: mockIssuedAt,
    })

    vi.mocked(sendMail).mockResolvedValue(undefined)
  })

  describe('emailLogin', () => {
    it('should create an auth token and OTP prefix', async () => {
      await emailLogin(mockEmail)

      expect(createAuthToken).toHaveBeenCalledWith(mockEmail)
      expect(createVfnPrefix).toHaveBeenCalled()
    })

    it('should upsert verification token in the database', async () => {
      await emailLogin(mockEmail)

      expect(db.verificationToken.upsert).toHaveBeenCalledWith({
        where: {
          identifier: mockEmail,
        },
        update: {
          token: mockHashedToken,
          attempts: 0,
        },
        create: {
          identifier: mockEmail,
          token: mockHashedToken,
        },
        select: {
          issuedAt: true,
        },
      })
    })

    it('should send an email with the correct OTP and expiry time', async () => {
      await emailLogin(mockEmail)

      const expectedExpiry = add(mockIssuedAt, { seconds: env.OTP_EXPIRY })
      const formattedExpiry = format(expectedExpiry, 'dd MMM yyyy, h:mmaaa')

      expect(sendMail).toHaveBeenCalledWith({
        subject: 'Sign in to localhost:3000',
        body: expect.stringContaining(
          `Your OTP is ${mockOtpPrefix}-<b>${mockToken}</b>`,
        ),
        recipient: mockEmail,
      })

      expect(sendMail).toHaveBeenCalledWith({
        subject: expect.any(String),
        body: expect.stringContaining(formattedExpiry),
        recipient: mockEmail,
      })
    })

    it('should include instructions in the email body', async () => {
      await emailLogin(mockEmail)

      const emailCall = vi.mocked(sendMail).mock.calls[0][0]
      expect(emailCall.body).toContain(
        'Please use this to login to your account',
      )
      expect(emailCall.body).toContain(
        'If your OTP does not work, please request for a new one',
      )
    })

    it('should return email and OTP prefix', async () => {
      const result = await emailLogin(mockEmail)

      expect(result).toEqual({
        email: mockEmail,
        otpPrefix: mockOtpPrefix,
      })
    })

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')
      vi.mocked(db.verificationToken.upsert).mockRejectedValue(dbError)

      await expect(emailLogin(mockEmail)).rejects.toThrow(
        'Database connection failed',
      )
    })

    it('should handle email sending errors gracefully', async () => {
      const emailError = new Error('Email service unavailable')
      vi.mocked(sendMail).mockRejectedValue(emailError)

      await expect(emailLogin(mockEmail)).rejects.toThrow(
        'Email service unavailable',
      )
    })

    it('should use the correct base URL in email subject', async () => {
      const customBaseUrl = 'https://example.com'
      vi.mocked(getBaseUrl).mockReturnValue(customBaseUrl)

      await emailLogin(mockEmail)

      expect(sendMail).toHaveBeenCalledWith({
        subject: 'Sign in to example.com',
        body: expect.any(String),
        recipient: mockEmail,
      })
    })

    it('should handle different OTP expiry times', async () => {
      const customExpiry = 300 // 5 minutes
      vi.mocked(env, true).OTP_EXPIRY = customExpiry

      await emailLogin(mockEmail)

      const expectedExpiry = add(mockIssuedAt, { seconds: customExpiry })
      const formattedExpiry = format(expectedExpiry, 'dd MMM yyyy, h:mmaaa')

      expect(sendMail).toHaveBeenCalledWith({
        subject: expect.any(String),
        body: expect.stringContaining(formattedExpiry),
        recipient: mockEmail,
      })
    })

    it('should reset attempts to 0 when upserting existing token', async () => {
      // First login
      await emailLogin(mockEmail)

      // Second login (should reset attempts)
      await emailLogin(mockEmail)

      expect(db.verificationToken.upsert).toHaveBeenLastCalledWith({
        where: {
          identifier: mockEmail,
        },
        update: {
          token: expect.any(String),
          attempts: 0,
        },
        create: {
          identifier: mockEmail,
          token: expect.any(String),
        },
        select: {
          issuedAt: true,
        },
      })
    })

    it('should handle emails with different formats', async () => {
      const emails = [
        'user@example.com',
        'user.name+tag@example.co.uk',
        'user_123@subdomain.example.com',
      ]

      for (const email of emails) {
        vi.clearAllMocks()
        const result = await emailLogin(email)

        expect(result.email).toBe(email)
        expect(createAuthToken).toHaveBeenCalledWith(email)
      }
    })
  })
})
