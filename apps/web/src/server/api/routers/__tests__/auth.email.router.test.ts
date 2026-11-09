import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetTables } from '~tests/db/utils'
import { createTestCaller, createTestContext } from '~tests/trpc'

import { db } from '@acme/db'

import { emailLogin } from '~/server/modules/auth/auth.service'
import { createVfnIdentifier } from '~/server/modules/auth/auth.utils'
import * as userService from '~/server/modules/user/user.service'

import {
  ssCreatePkceChallenge,
  ssCreatePkceVerifier,
} from '~/lib/pkce/server-pkce'

describe('auth.email router', () => {
  beforeEach(async () => {
    await resetTables(['VerificationToken', 'User', 'Account'])
    vi.restoreAllMocks()
  })

  describe('verifyOtp', () => {
    it('retains the verification token when login fails after OTP validation', async () => {
      const email = 'test@data.gov.sg'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const vfnIdentifier = createVfnIdentifier({ codeChallenge, email })

      const { token } = await emailLogin({ codeChallenge, email })

      vi.spyOn(userService, 'loginUserByEmail').mockRejectedValueOnce(
        new Error('database unavailable')
      )

      const caller = createTestCaller(createTestContext())

      await expect(
        caller.auth.email.verifyOtp({
          codeVerifier,
          email,
          token,
        })
      ).rejects.toThrow('database unavailable')

      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier },
      })

      expect(verificationToken).not.toBeNull()
    })

    it('deletes the verification token after session is saved', async () => {
      const email = 'test@data.gov.sg'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const vfnIdentifier = createVfnIdentifier({ codeChallenge, email })

      const { token } = await emailLogin({ codeChallenge, email })

      const ctx = createTestContext()
      const caller = createTestCaller(ctx)

      await caller.auth.email.verifyOtp({
        codeVerifier,
        email,
        token,
      })

      expect(ctx.session.save).toHaveBeenCalled()

      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier },
      })

      expect(verificationToken).toBeNull()
    })

    it('retains the verification token when session save fails after OTP validation', async () => {
      const email = 'test@data.gov.sg'
      const codeVerifier = ssCreatePkceVerifier()
      const codeChallenge = ssCreatePkceChallenge(codeVerifier)
      const vfnIdentifier = createVfnIdentifier({ codeChallenge, email })

      const { token } = await emailLogin({ codeChallenge, email })

      const ctx = createTestContext()
      vi.mocked(ctx.session.save).mockRejectedValueOnce(
        new Error('cookie store unavailable')
      )

      const caller = createTestCaller(ctx)

      await expect(
        caller.auth.email.verifyOtp({
          codeVerifier,
          email,
          token,
        })
      ).rejects.toThrow('cookie store unavailable')

      const verificationToken = await db.verificationToken.findUnique({
        where: { identifier: vfnIdentifier },
      })

      expect(verificationToken).not.toBeNull()
    })
  })

  describe('login', () => {
    it('rejects reusing the same PKCE code challenge for the same email', async () => {
      const email = 'test@data.gov.sg'
      const codeChallenge = ssCreatePkceChallenge(ssCreatePkceVerifier())

      const caller = createTestCaller(createTestContext())

      await caller.auth.email.login({ codeChallenge, email })

      await expect(
        caller.auth.email.login({ codeChallenge, email })
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Please refresh and try again.',
      })
    })
  })
})
