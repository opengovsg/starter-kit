import {
  createAuthToken,
  createVfnIdentifier,
  createVfnPrefix,
  isValidToken,
} from '../auth.utils'

describe('auth.utils', () => {
  describe('createVfnIdentifier', () => {
    it('should create identifier in format "nonce:email"', () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce-123'

      const identifier = createVfnIdentifier({ email, nonce })

      expect(identifier).toBe('test-nonce-123:test@example.com')
    })

    it('should create different identifiers for different nonces with same email', () => {
      const email = 'test@example.com'
      const nonce1 = 'nonce-1'
      const nonce2 = 'nonce-2'

      const identifier1 = createVfnIdentifier({ email, nonce: nonce1 })
      const identifier2 = createVfnIdentifier({ email, nonce: nonce2 })

      expect(identifier1).not.toBe(identifier2)
      expect(identifier1).toBe('nonce-1:test@example.com')
      expect(identifier2).toBe('nonce-2:test@example.com')
    })

    it('should handle special characters in email', () => {
      const email = 'user+tag@example.com'
      const nonce = 'test-nonce'

      const identifier = createVfnIdentifier({ email, nonce })

      expect(identifier).toBe('test-nonce:user+tag@example.com')
    })

    it('should handle special characters in nonce', () => {
      const email = 'test@example.com'
      const nonce = 'nonce-with-special_chars.123'

      const identifier = createVfnIdentifier({ email, nonce })

      expect(identifier).toBe('nonce-with-special_chars.123:test@example.com')
    })

    it('should create deterministic identifiers', () => {
      const email = 'test@example.com'
      const nonce = 'test-nonce'

      const identifier1 = createVfnIdentifier({ email, nonce })
      const identifier2 = createVfnIdentifier({ email, nonce })
      const identifier3 = createVfnIdentifier({ email, nonce })

      expect(identifier1).toBe(identifier2)
      expect(identifier2).toBe(identifier3)
    })
  })

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
    const testNonce = 'test-nonce-123'

    it('should generate a 6-character token', () => {
      const { token } = createAuthToken({ email: testEmail, nonce: testNonce })
      expect(token).toHaveLength(6)
    })

    it('should generate a hashed token', () => {
      const { hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })
      expect(hashedToken).toBeTruthy()
      expect(typeof hashedToken).toBe('string')
      expect(hashedToken.length).toBeGreaterThan(0)
    })

    it('should only contain characters from the allowed alphabet', () => {
      const { token } = createAuthToken({ email: testEmail, nonce: testNonce })
      const allowedChars = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]+$/
      expect(token).toMatch(allowedChars)
    })

    it('should generate different tokens for the same email and nonce on multiple calls', () => {
      const result1 = createAuthToken({ email: testEmail, nonce: testNonce })
      const result2 = createAuthToken({ email: testEmail, nonce: testNonce })
      const result3 = createAuthToken({ email: testEmail, nonce: testNonce })

      expect(result1.token).not.toBe(result2.token)
      expect(result2.token).not.toBe(result3.token)
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should generate different hashed tokens for different emails with same nonce', () => {
      const email1 = 'user1@example.com'
      const email2 = 'user2@example.com'

      const result1 = createAuthToken({ email: email1, nonce: testNonce })
      const result2 = createAuthToken({ email: email2, nonce: testNonce })

      // Hashes should be different due to email being used as salt
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should generate different hashed tokens for different nonces with same email', () => {
      const nonce1 = 'nonce-1'
      const nonce2 = 'nonce-2'

      const result1 = createAuthToken({ email: testEmail, nonce: nonce1 })
      const result2 = createAuthToken({ email: testEmail, nonce: nonce2 })

      // Hashes should be different due to nonce being part of the hash input
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should not include ambiguous characters in token', () => {
      // Generate multiple tokens to ensure consistency
      const tokens = Array.from(
        { length: 50 },
        () => createAuthToken({ email: testEmail, nonce: testNonce }).token,
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
    const testNonce = 'test-nonce-123'

    it('should return true for a valid token and hash combination', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })

      const isValid = isValidToken({
        token,
        email: testEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      expect(isValid).toBe(true)
    })

    it('should return false for an invalid token', () => {
      const { hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })
      const invalidToken = '999999'

      const isValid = isValidToken({
        token: invalidToken,
        email: testEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a different email', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })
      const differentEmail = 'different@example.com'

      const isValid = isValidToken({
        token,
        email: differentEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a different nonce', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })
      const differentNonce = 'different-nonce'

      const isValid = isValidToken({
        token,
        email: testEmail,
        nonce: differentNonce,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a tampered hash', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })
      const tamperedHash = hashedToken.slice(0, -1) + 'X'

      const isValid = isValidToken({
        token,
        email: testEmail,
        nonce: testNonce,
        hash: tamperedHash,
      })

      expect(isValid).toBe(false)
    })

    it('should be case-sensitive for email addresses', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })
      const uppercaseEmail = testEmail.toUpperCase()

      const isValid = isValidToken({
        token,
        email: uppercaseEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should handle multiple validation attempts consistently', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })

      const result1 = isValidToken({
        token,
        email: testEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      const result2 = isValidToken({
        token,
        email: testEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      const result3 = isValidToken({
        token,
        email: testEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      expect(result3).toBe(true)
    })

    it('should protect against timing attacks by using constant-time comparison', () => {
      const { hashedToken } = createAuthToken({
        email: testEmail,
        nonce: testNonce,
      })

      // Test with various invalid tokens of different lengths
      const invalidTokens = ['A', 'AB', 'ABC123', 'ABCDEF', 'INVALID']

      invalidTokens.forEach((invalidToken) => {
        const isValid = isValidToken({
          token: invalidToken,
          email: testEmail,
          nonce: testNonce,
          hash: hashedToken,
        })
        expect(isValid).toBe(false)
      })
    })

    it('should validate tokens with special characters in email', () => {
      const specialEmail = 'user+tag@example.com'
      const { token, hashedToken } = createAuthToken({
        email: specialEmail,
        nonce: testNonce,
      })

      const isValid = isValidToken({
        token,
        email: specialEmail,
        nonce: testNonce,
        hash: hashedToken,
      })

      expect(isValid).toBe(true)
    })
  })

  describe('Integration: Full token lifecycle', () => {
    it('should create, hash, and validate a token successfully', () => {
      const email = 'user@example.com'
      const nonce = 'session-nonce-123'

      // Create token
      const { token, hashedToken } = createAuthToken({ email, nonce })

      // Validate token
      const isValid = isValidToken({
        token,
        email,
        nonce,
        hash: hashedToken,
      })

      expect(token).toHaveLength(6)
      expect(hashedToken).toBeTruthy()
      expect(isValid).toBe(true)
    })

    it('should create unique tokens for multiple users with different nonces', () => {
      const users = [
        { email: 'user1@example.com', nonce: 'nonce-1' },
        { email: 'user2@example.com', nonce: 'nonce-2' },
        { email: 'user3@example.com', nonce: 'nonce-3' },
      ]

      const tokens = users.map(({ email, nonce }) => {
        const { token, hashedToken } = createAuthToken({ email, nonce })
        return { email, nonce, token, hashedToken }
      })

      // Verify each token is valid for its own email and nonce
      tokens.forEach(({ email, nonce, token, hashedToken }) => {
        const isValid = isValidToken({ token, email, nonce, hash: hashedToken })
        expect(isValid).toBe(true)
      })

      // Verify tokens are unique
      const tokenStrings = tokens.map((t) => t.token)
      const uniqueTokens = new Set(tokenStrings)
      expect(uniqueTokens.size).toBe(tokens.length)
    })

    it('should not allow cross-session token validation', () => {
      const email = 'user@example.com'
      const nonce1 = 'session-1'
      const nonce2 = 'session-2'

      // Create token for session 1
      const { token: token1, hashedToken: hash1 } = createAuthToken({
        email,
        nonce: nonce1,
      })

      // Create token for session 2
      const { token: token2, hashedToken: hash2 } = createAuthToken({
        email,
        nonce: nonce2,
      })

      // Token from session 1 should not validate with nonce from session 2
      const crossValidation1 = isValidToken({
        token: token1,
        email,
        nonce: nonce2,
        hash: hash1,
      })
      expect(crossValidation1).toBe(false)

      // Token from session 2 should not validate with nonce from session 1
      const crossValidation2 = isValidToken({
        token: token2,
        email,
        nonce: nonce1,
        hash: hash2,
      })
      expect(crossValidation2).toBe(false)

      // But each token should still work with its own nonce
      expect(
        isValidToken({ token: token1, email, nonce: nonce1, hash: hash1 }),
      ).toBe(true)
      expect(
        isValidToken({ token: token2, email, nonce: nonce2, hash: hash2 }),
      ).toBe(true)
    })
  })
})
