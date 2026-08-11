import '../../mail/__mocks__/mail.service'
import { createPkceChallenge, createPkceVerifier } from '@opengovsg/auth/pkce'
import { add } from 'date-fns/add'
import { mock, mockDeep } from 'vitest-mock-extended'
import { resetTables } from '~tests/db/utils'

import type { Logger } from '@acme/logging'

import { db } from '@acme/db'

import * as mailService from '../../mail/mail.service'
import { emailLogin, emailVerifyOtp } from '../auth.service'

const mockedMailService = mock(mailService)
const logger = mockDeep<Logger>()

const INVALID_OR_EXPIRED_MESSAGE =
  'Token is invalid or has expired. Please request a new OTP.'
const NOT_FOUND_OR_REUSED_MESSAGE =
  'Wrong OTP entered or OTP already used, make sure to use the OTP that corresponds to the 3 character prefix.'
const TOO_MANY_ATTEMPTS_MESSAGE =
  'Wrong OTP was entered too many times. Please request a new OTP.'

const getIssuedOtp = () => {
  const body = mockedMailService.sendMail.mock.calls.at(-1)?.[0]?.body
  const match = body?.match(/<b>([^<]+)<\/b>/)
  if (!match?.[1]) {
    throw new Error('Expected sendMail to include an OTP in the body')
  }
  return match[1]
}

describe('auth.service', () => {
  beforeEach(async () => {
    await resetTables(['VerificationToken', 'User', 'Account'])
  })

  describe('emailLogin', () => {
    it('should create a verification token and send OTP email', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      const result = await emailLogin({ email, codeChallenge })

      expect(result).toEqual({
        email,
        otpPrefix: expect.any(String),
      })

      const tokens = await db.verificationToken.findMany()
      expect(tokens).toHaveLength(1)
      expect(mockedMailService.sendMail).toHaveBeenCalledWith({
        body: expect.any(String),
        recipient: email,
        subject: expect.stringContaining('Sign in to '),
      })
    })

    it('should throw when code challenge is reused', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })

      await expect(emailLogin({ email, codeChallenge })).rejects.toThrow(
        'Please refresh and try again.'
      )
    })

    it('should allow different codeChallenges for same email', async () => {
      const email = 'test@example.com'
      const codeChallenge1 = await createPkceChallenge(createPkceVerifier())
      const codeChallenge2 = await createPkceChallenge(createPkceVerifier())

      await emailLogin({ email, codeChallenge: codeChallenge1 })
      await emailLogin({ email, codeChallenge: codeChallenge2 })

      const tokens = await db.verificationToken.findMany()
      expect(tokens).toHaveLength(2)
      expect(tokens[0]?.token).not.toBe(tokens[1]?.token)
    })
  })

  describe('emailVerifyOtp', () => {
    it('should successfully verify a valid OTP', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })
      const token = getIssuedOtp()

      await expect(
        emailVerifyOtp({ email, token, codeVerifier, logger })
      ).resolves.toEqual({ email })

      expect(await db.verificationToken.count()).toBe(0)
    })

    it('should reject a correct OTP with wrong codeVerifier', async () => {
      const email = 'test@example.com'
      const correctVerifier = createPkceVerifier()
      const wrongVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(correctVerifier)

      await emailLogin({ email, codeChallenge })
      const token = getIssuedOtp()

      await expect(
        emailVerifyOtp({
          email,
          token,
          codeVerifier: wrongVerifier,
          logger,
        })
      ).rejects.toThrow(NOT_FOUND_OR_REUSED_MESSAGE)
    })

    it('should throw error for non-existent codeChallenge', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const token = '12345678'

      await expect(
        emailVerifyOtp({ email, token, codeVerifier, logger })
      ).rejects.toThrow(NOT_FOUND_OR_REUSED_MESSAGE)
    })

    it('should reject a wrong OTP with wrong codeVerifier', async () => {
      const email = 'test@example.com'
      const correctCodeChallenge =
        await createPkceChallenge(createPkceVerifier())
      const wrongVerifier = createPkceVerifier()

      await emailLogin({ email, codeChallenge: correctCodeChallenge })

      await expect(
        emailVerifyOtp({
          email,
          token: 'WRONGOTP',
          codeVerifier: wrongVerifier,
          logger,
        })
      ).rejects.toThrow(NOT_FOUND_OR_REUSED_MESSAGE)
    })

    it('should reject a wrong OTP with correct codeVerifier', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })
      await expect(
        emailVerifyOtp({
          email,
          token: 'WRONGOTP',
          codeVerifier,
          logger,
        })
      ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
    })

    it('should reject an expired OTP with correct codeVerifier', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })
      const token = getIssuedOtp()

      const record = await db.verificationToken.findFirstOrThrow()
      await db.verificationToken.update({
        where: { identifier: record.identifier },
        data: {
          // Beyond the configured 600s OTP_EXPIRY
          issuedAt: add(new Date(), { seconds: -700 }),
        },
      })

      await expect(
        emailVerifyOtp({ email, token, codeVerifier, logger })
      ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
    })

    it('should increment attempts on each verification try', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })
      const identifier = (await db.verificationToken.findFirstOrThrow())
        .identifier

      for (let i = 1; i <= 2; i++) {
        await expect(
          emailVerifyOtp({
            email,
            token: 'WRONGOTP',
            codeVerifier,
            logger,
          })
        ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
        const verificationToken = await db.verificationToken.findUnique({
          where: { identifier },
        })
        expect(verificationToken?.attempts).toBe(i)
      }
    })

    it('should reject after too many failed attempts (>5)', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })

      for (let i = 0; i < 5; i++) {
        await expect(
          emailVerifyOtp({
            email,
            token: 'WRONGOTP',
            codeVerifier,
            logger,
          })
        ).rejects.toThrow(INVALID_OR_EXPIRED_MESSAGE)
      }

      await expect(
        emailVerifyOtp({
          email,
          token: 'WRONGOTP',
          codeVerifier,
          logger,
        })
      ).rejects.toThrow(TOO_MANY_ATTEMPTS_MESSAGE)
    })

    it('should delete verification token after successful verification', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })
      const token = getIssuedOtp()

      await emailVerifyOtp({ email, token, codeVerifier, logger })

      expect(await db.verificationToken.count()).toBe(0)
    })

    it('should prevent token reuse after successful verification', async () => {
      const email = 'test@example.com'
      const codeVerifier = createPkceVerifier()
      const codeChallenge = await createPkceChallenge(codeVerifier)

      await emailLogin({ email, codeChallenge })
      const token = getIssuedOtp()

      await expect(
        emailVerifyOtp({ email, token, codeVerifier, logger })
      ).resolves.toEqual({ email })

      await expect(
        emailVerifyOtp({ email, token, codeVerifier, logger })
      ).rejects.toThrow(NOT_FOUND_OR_REUSED_MESSAGE)
    })
  })
})
