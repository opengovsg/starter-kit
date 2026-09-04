import { describe, expect, it } from 'vitest'

import {
  createAuthToken,
  createVfnIdentifier,
  createVfnPrefix,
  isValidToken,
} from '../auth.utils'

describe('auth.utils', () => {
  describe(createVfnIdentifier, () => {
    it('should create different identifiers for different codeChallenges with same email', () => {
      const email = 'test@example.com'
      const codeChallenge1 = 'codeChallenge-1'
      const codeChallenge2 = 'codeChallenge-2'

      const identifier1 = createVfnIdentifier({
        codeChallenge: codeChallenge1,
        email,
      })
      const identifier2 = createVfnIdentifier({
        codeChallenge: codeChallenge2,
        email,
      })

      expect(identifier1).not.toBe(identifier2)
    })

    it('should create deterministic identifiers', () => {
      const email = 'test@example.com'
      const codeChallenge = 'test-codeChallenge'

      const identifier1 = createVfnIdentifier({
        codeChallenge,
        email,
      })
      const identifier2 = createVfnIdentifier({
        codeChallenge,
        email,
      })
      const identifier3 = createVfnIdentifier({
        codeChallenge,
        email,
      })

      expect(identifier1).toBe(identifier2)
      expect(identifier2).toBe(identifier3)
    })
  })

  describe(createVfnPrefix, () => {
    it('should only contain uppercase letters from the allowed alphabet', () => {
      const prefix = createVfnPrefix()
      const allowedChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ]+$/u
      expect(prefix).toMatch(allowedChars)
    })

    it('should generate different prefixes on multiple calls', () => {
      const prefix1 = createVfnPrefix()
      const prefix2 = createVfnPrefix()
      const prefix3 = createVfnPrefix()
      const prefix4 = createVfnPrefix()
      const prefix5 = createVfnPrefix()

      // While theoretically they could be the same, the probability is very low
      const prefixes = new Set([prefix1, prefix2, prefix3, prefix4, prefix5])
      expect(prefixes.size).toBeGreaterThan(1)
    })

    it('should not include ambiguous characters (I, O, 0, 1)', () => {
      // Generate multiple prefixes to ensure consistency
      const prefixes = Array.from({ length: 50 }, () => createVfnPrefix())
      const combinedString = prefixes.join('')

      expect(combinedString).not.toContain('I')
      expect(combinedString).not.toContain('O')
      expect(combinedString).not.toContain('0')
      expect(combinedString).not.toContain('1')
    })
  })

  describe(createAuthToken, () => {
    const testEmail = 'test@example.com'
    const testCodeChallenge = 'test-codeChallenge-123'

    it('should generate tokens of sufficient entropy', () => {
      const N = 50
      const tokens = Array.from({ length: N }).map(
        () =>
          createAuthToken({
            codeChallenge: testCodeChallenge,
            email: testEmail,
          }).token
      )

      expect(new Set(tokens).size).toBe(N)
    })

    it('should generate different tokens for the same email and codeChallenge on multiple calls', () => {
      const result1 = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })
      const result2 = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })
      const result3 = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })

      expect(result1.token).not.toBe(result2.token)
      expect(result2.token).not.toBe(result3.token)
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should generate different hashed tokens for different emails with same codeChallenge', () => {
      const email1 = 'user1@example.com'
      const email2 = 'user2@example.com'

      const result1 = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: email1,
      })
      const result2 = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: email2,
      })

      // Hashes should be different due to email being used as salt
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should generate different hashed tokens for different code challenges with same email', () => {
      const codeChallenge1 = 'codeChallenge-1'
      const codeChallenge2 = 'codeChallenge-2'

      const result1 = createAuthToken({
        codeChallenge: codeChallenge1,
        email: testEmail,
      })
      const result2 = createAuthToken({
        codeChallenge: codeChallenge2,
        email: testEmail,
      })

      // Hashes should be different due to codeChallenge being part of the hash input
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should not include ambiguous characters in token', () => {
      // Generate multiple tokens to ensure consistency
      const tokens = Array.from(
        { length: 50 },
        () =>
          createAuthToken({
            codeChallenge: testCodeChallenge,
            email: testEmail,
          }).token
      )
      const combinedString = tokens.join('')

      expect(combinedString).not.toContain('I')
      expect(combinedString).not.toContain('O')
      expect(combinedString).not.toContain('0')
      expect(combinedString).not.toContain('1')
    })
  })

  describe(isValidToken, () => {
    const testEmail = 'test@example.com'
    const testCodeChallenge = 'test-codeChallenge-123'

    it('should return true for a valid token and hash combination', () => {
      const { token, hashedToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })

      const isValid = isValidToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
        hash: hashedToken,
        token,
      })

      expect(isValid).toBeTruthy()
    })

    it('should return false for an invalid token', () => {
      const { hashedToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })
      const { token: invalidToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })

      const isValid = isValidToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
        hash: hashedToken,
        token: invalidToken,
      })

      expect(isValid).toBeFalsy()
    })

    it('should return false for a different email', () => {
      const { token, hashedToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })
      const differentEmail = 'different@example.com'

      const isValid = isValidToken({
        codeChallenge: testCodeChallenge,
        email: differentEmail,
        hash: hashedToken,
        token,
      })

      expect(isValid).toBeFalsy()
    })

    it('should return false for a different codeChallenge', () => {
      const { token, hashedToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })
      const differentCodeChallenge = 'different-codeChallenge'

      const isValid = isValidToken({
        codeChallenge: differentCodeChallenge,
        email: testEmail,
        hash: hashedToken,
        token,
      })

      expect(isValid).toBeFalsy()
    })

    it('should return false for a tampered hash', () => {
      const { token, hashedToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })
      const tamperedHash = `${hashedToken.slice(0, -1)}X`

      const isValid = isValidToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
        hash: tamperedHash,
        token,
      })

      expect(isValid).toBeFalsy()
    })

    it('should handle multiple validation attempts consistently', () => {
      const { token, hashedToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
      })

      const result1 = isValidToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
        hash: hashedToken,
        token,
      })

      const result2 = isValidToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
        hash: hashedToken,
        token,
      })

      const result3 = isValidToken({
        codeChallenge: testCodeChallenge,
        email: testEmail,
        hash: hashedToken,
        token,
      })

      expect(result1).toBeTruthy()
      expect(result2).toBeTruthy()
      expect(result3).toBeTruthy()
    })

    it('should validate tokens with special characters in email', () => {
      const specialEmail = 'user+tag@example.com'
      const { token, hashedToken } = createAuthToken({
        codeChallenge: testCodeChallenge,
        email: specialEmail,
      })

      const isValid = isValidToken({
        codeChallenge: testCodeChallenge,
        email: specialEmail,
        hash: hashedToken,
        token,
      })

      expect(isValid).toBeTruthy()
    })
  })

  describe('Integration: Full token lifecycle', () => {
    it('should create, hash, and validate a token successfully', () => {
      const email = 'user@example.com'
      const codeChallenge = 'session-codeChallenge-123'

      // Create token
      const { token, hashedToken } = createAuthToken({ codeChallenge, email })

      // Validate token
      const isValid = isValidToken({
        codeChallenge,
        email,
        hash: hashedToken,
        token,
      })

      expect(hashedToken).toBeTruthy()
      expect(isValid).toBeTruthy()
    })

    it('should create unique tokens for multiple users with different codeChallenges', () => {
      const users = [
        { codeChallenge: 'codeChallenge-1', email: 'user1@example.com' },
        { codeChallenge: 'codeChallenge-2', email: 'user2@example.com' },
        { codeChallenge: 'codeChallenge-3', email: 'user3@example.com' },
      ]

      const tokens = users.map(({ email, codeChallenge }) => {
        const { token, hashedToken } = createAuthToken({
          codeChallenge,
          email,
        })
        return { codeChallenge, email, hashedToken, token }
      })

      // Verify each token is valid for its own email and codeChallenge
      for (const { email, codeChallenge, token, hashedToken } of tokens) {
        const isValid = isValidToken({
          codeChallenge,
          email,
          hash: hashedToken,
          token,
        })
        expect(isValid).toBeTruthy()
      }

      // Verify tokens are unique
      const tokenStrings = tokens.map((t) => t.token)
      const uniqueTokens = new Set(tokenStrings)
      expect(uniqueTokens.size).toBe(tokens.length)
    })

    it('should not allow cross-session token validation', () => {
      const email = 'user@example.com'
      const codeChallenge1 = 'session-1'
      const codeChallenge2 = 'session-2'

      // Create token for session 1
      const { token: token1, hashedToken: hash1 } = createAuthToken({
        codeChallenge: codeChallenge1,
        email,
      })

      // Create token for session 2
      const { token: token2, hashedToken: hash2 } = createAuthToken({
        codeChallenge: codeChallenge2,
        email,
      })

      // Token from session 1 should not validate with codeChallenge from session 2
      const crossValidation1 = isValidToken({
        codeChallenge: codeChallenge2,
        email,
        hash: hash1,
        token: token1,
      })
      expect(crossValidation1).toBeFalsy()

      // Token from session 2 should not validate with codeChallenge from session 1
      const crossValidation2 = isValidToken({
        codeChallenge: codeChallenge1,
        email,
        hash: hash2,
        token: token2,
      })
      expect(crossValidation2).toBeFalsy()

      // But each token should still work with its own codeChallenge
      expect(
        isValidToken({
          codeChallenge: codeChallenge1,
          email,
          hash: hash1,
          token: token1,
        })
      ).toBeTruthy()
      expect(
        isValidToken({
          codeChallenge: codeChallenge2,
          email,
          hash: hash2,
          token: token2,
        })
      ).toBeTruthy()
    })
  })
})
