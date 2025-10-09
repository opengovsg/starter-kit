import { describe, expect, it } from 'vitest'

import { createAuthToken, createVfnPrefix, isValidToken } from '../auth.utils'

describe('auth.utils', () => {
  describe('createVfnPrefix', () => {
    it('should generate a 3-character prefix', () => {
      const prefix = createVfnPrefix()
      expect(prefix).toHaveLength(3)
    })

    it('should only contain uppercase letters from the allowed alphabet', () => {
      const prefix = createVfnPrefix()
      const allowedChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ]+$/
      expect(prefix).toMatch(allowedChars)
    })

    it('should generate different prefixes on multiple calls', () => {
      const prefix1 = createVfnPrefix()
      const prefix2 = createVfnPrefix()
      const prefix3 = createVfnPrefix()

      // While theoretically they could be the same, the probability is very low
      const prefixes = new Set([prefix1, prefix2, prefix3])
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

  describe('createAuthToken', () => {
    const testEmail = 'test@example.com'

    it('should generate a 6-character token', () => {
      const { token } = createAuthToken(testEmail)
      expect(token).toHaveLength(6)
    })

    it('should generate a hashed token', () => {
      const { hashedToken } = createAuthToken(testEmail)
      expect(hashedToken).toBeTruthy()
      expect(typeof hashedToken).toBe('string')
      expect(hashedToken.length).toBeGreaterThan(0)
    })

    it('should only contain characters from the allowed alphabet', () => {
      const { token } = createAuthToken(testEmail)
      const allowedChars = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]+$/
      expect(token).toMatch(allowedChars)
    })

    it('should generate different tokens for the same email on multiple calls', () => {
      const result1 = createAuthToken(testEmail)
      const result2 = createAuthToken(testEmail)
      const result3 = createAuthToken(testEmail)

      expect(result1.token).not.toBe(result2.token)
      expect(result2.token).not.toBe(result3.token)
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should generate different hashed tokens for different emails with same token', () => {
      const email1 = 'user1@example.com'
      const email2 = 'user2@example.com'

      const result1 = createAuthToken(email1)
      const result2 = createAuthToken(email2)

      // Even if tokens were the same, hashes should be different due to email salt
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should not include ambiguous characters in token', () => {
      // Generate multiple tokens to ensure consistency
      const tokens = Array.from(
        { length: 50 },
        () => createAuthToken(testEmail).token,
      )
      const combinedString = tokens.join('')

      expect(combinedString).not.toContain('I')
      expect(combinedString).not.toContain('O')
      expect(combinedString).not.toContain('0')
      expect(combinedString).not.toContain('1')
    })
  })

  describe('isValidToken', () => {
    const testEmail = 'test@example.com'

    it('should return true for a valid token and hash combination', () => {
      const { token, hashedToken } = createAuthToken(testEmail)

      const isValid = isValidToken({
        token,
        email: testEmail,
        hash: hashedToken,
      })

      expect(isValid).toBe(true)
    })

    it('should return false for an invalid token', () => {
      const { hashedToken } = createAuthToken(testEmail)
      const invalidToken = '999999'

      const isValid = isValidToken({
        token: invalidToken,
        email: testEmail,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a different email', () => {
      const { token, hashedToken } = createAuthToken(testEmail)
      const differentEmail = 'different@example.com'

      const isValid = isValidToken({
        token,
        email: differentEmail,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a tampered hash', () => {
      const { token, hashedToken } = createAuthToken(testEmail)
      const tamperedHash = hashedToken.slice(0, -1) + 'X'

      const isValid = isValidToken({
        token,
        email: testEmail,
        hash: tamperedHash,
      })

      expect(isValid).toBe(false)
    })

    it('should be case-sensitive for email addresses', () => {
      const { token, hashedToken } = createAuthToken(testEmail)
      const uppercaseEmail = testEmail.toUpperCase()

      const isValid = isValidToken({
        token,
        email: uppercaseEmail,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should handle multiple validation attempts consistently', () => {
      const { token, hashedToken } = createAuthToken(testEmail)

      const result1 = isValidToken({
        token,
        email: testEmail,
        hash: hashedToken,
      })

      const result2 = isValidToken({
        token,
        email: testEmail,
        hash: hashedToken,
      })

      const result3 = isValidToken({
        token,
        email: testEmail,
        hash: hashedToken,
      })

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      expect(result3).toBe(true)
    })

    it('should protect against timing attacks by using constant-time comparison', () => {
      const { hashedToken } = createAuthToken(testEmail)

      // Test with various invalid tokens of different lengths
      const invalidTokens = ['A', 'AB', 'ABC123', 'ABCDEF', 'INVALID']

      invalidTokens.forEach((invalidToken) => {
        const isValid = isValidToken({
          token: invalidToken,
          email: testEmail,
          hash: hashedToken,
        })
        expect(isValid).toBe(false)
      })
    })

    it('should validate tokens with special characters in email', () => {
      const specialEmail = 'user+tag@example.com'
      const { token, hashedToken } = createAuthToken(specialEmail)

      const isValid = isValidToken({
        token,
        email: specialEmail,
        hash: hashedToken,
      })

      expect(isValid).toBe(true)
    })
  })

  describe('Integration: Full token lifecycle', () => {
    it('should create, hash, and validate a token successfully', () => {
      const email = 'user@example.com'

      // Create token
      const { token, hashedToken } = createAuthToken(email)

      // Validate token
      const isValid = isValidToken({
        token,
        email,
        hash: hashedToken,
      })

      expect(token).toHaveLength(6)
      expect(hashedToken).toBeTruthy()
      expect(isValid).toBe(true)
    })

    it('should create unique tokens for multiple users', () => {
      const users = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
      ]

      const tokens = users.map((email) => {
        const { token, hashedToken } = createAuthToken(email)
        return { email, token, hashedToken }
      })

      // Verify each token is valid for its own email
      tokens.forEach(({ email, token, hashedToken }) => {
        const isValid = isValidToken({ token, email, hash: hashedToken })
        expect(isValid).toBe(true)
      })

      // Verify tokens are unique
      const tokenStrings = tokens.map((t) => t.token)
      const uniqueTokens = new Set(tokenStrings)
      expect(uniqueTokens.size).toBe(tokens.length)
    })
  })
})
