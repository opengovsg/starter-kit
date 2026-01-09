import {
  createAuthToken,
  createVfnIdentifier,
  createVfnPrefix,
  isValidToken,
} from '../auth.utils'

describe('auth.utils', () => {
  describe('createVfnIdentifier', () => {
    it('should create different identifiers for different codeChallenges with same email', () => {
      const email = 'test@example.com'
      const codeChallenge1 = 'codeChallenge-1'
      const codeChallenge2 = 'codeChallenge-2'

      const identifier1 = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge1,
      })
      const identifier2 = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge2,
      })

      expect(identifier1).not.toBe(identifier2)
    })

    it('should create deterministic identifiers', () => {
      const email = 'test@example.com'
      const codeChallenge = 'test-codeChallenge'

      const identifier1 = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge,
      })
      const identifier2 = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge,
      })
      const identifier3 = createVfnIdentifier({
        email,
        codeChallenge: codeChallenge,
      })

      expect(identifier1).toBe(identifier2)
      expect(identifier2).toBe(identifier3)
    })
  })

  describe('createVfnPrefix', () => {
    it('should only contain uppercase letters from the allowed alphabet', () => {
      const prefix = createVfnPrefix()
      const allowedChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ]+$/
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

  describe('createAuthToken', () => {
    const testEmail = 'test@example.com'
    const testCodeChallenge = 'test-codeChallenge-123'

    it('should generate tokens of sufficient entropy', () => {
      const N = 50
      const tokens = Array.from({ length: N }).map(
        () =>
          createAuthToken({
            email: testEmail,
            codeChallenge: testCodeChallenge,
          }).token,
      )

      expect(new Set(tokens).size).toBe(N)
    })

    it('should generate different tokens for the same email and codeChallenge on multiple calls', () => {
      const result1 = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })
      const result2 = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })
      const result3 = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })

      expect(result1.token).not.toBe(result2.token)
      expect(result2.token).not.toBe(result3.token)
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should generate different hashed tokens for different emails with same codeChallenge', () => {
      const email1 = 'user1@example.com'
      const email2 = 'user2@example.com'

      const result1 = createAuthToken({
        email: email1,
        codeChallenge: testCodeChallenge,
      })
      const result2 = createAuthToken({
        email: email2,
        codeChallenge: testCodeChallenge,
      })

      // Hashes should be different due to email being used as salt
      expect(result1.hashedToken).not.toBe(result2.hashedToken)
    })

    it('should generate different hashed tokens for different code challenges with same email', () => {
      const codeChallenge1 = 'codeChallenge-1'
      const codeChallenge2 = 'codeChallenge-2'

      const result1 = createAuthToken({
        email: testEmail,
        codeChallenge: codeChallenge1,
      })
      const result2 = createAuthToken({
        email: testEmail,
        codeChallenge: codeChallenge2,
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
            email: testEmail,
            codeChallenge: testCodeChallenge,
          }).token,
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
    const testCodeChallenge = 'test-codeChallenge-123'

    it('should return true for a valid token and hash combination', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })

      const isValid = isValidToken({
        token,
        email: testEmail,
        codeChallenge: testCodeChallenge,
        hash: hashedToken,
      })

      expect(isValid).toBe(true)
    })

    it('should return false for an invalid token', () => {
      const { hashedToken } = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })
      const { token: invalidToken } = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })

      const isValid = isValidToken({
        token: invalidToken,
        email: testEmail,
        codeChallenge: testCodeChallenge,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a different email', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })
      const differentEmail = 'different@example.com'

      const isValid = isValidToken({
        token,
        email: differentEmail,
        codeChallenge: testCodeChallenge,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a different codeChallenge', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })
      const differentCodeChallenge = 'different-codeChallenge'

      const isValid = isValidToken({
        token,
        email: testEmail,
        codeChallenge: differentCodeChallenge,
        hash: hashedToken,
      })

      expect(isValid).toBe(false)
    })

    it('should return false for a tampered hash', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })
      const tamperedHash = hashedToken.slice(0, -1) + 'X'

      const isValid = isValidToken({
        token,
        email: testEmail,
        codeChallenge: testCodeChallenge,
        hash: tamperedHash,
      })

      expect(isValid).toBe(false)
    })

    it('should handle multiple validation attempts consistently', () => {
      const { token, hashedToken } = createAuthToken({
        email: testEmail,
        codeChallenge: testCodeChallenge,
      })

      const result1 = isValidToken({
        token,
        email: testEmail,
        codeChallenge: testCodeChallenge,
        hash: hashedToken,
      })

      const result2 = isValidToken({
        token,
        email: testEmail,
        codeChallenge: testCodeChallenge,
        hash: hashedToken,
      })

      const result3 = isValidToken({
        token,
        email: testEmail,
        codeChallenge: testCodeChallenge,
        hash: hashedToken,
      })

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      expect(result3).toBe(true)
    })

    it('should validate tokens with special characters in email', () => {
      const specialEmail = 'user+tag@example.com'
      const { token, hashedToken } = createAuthToken({
        email: specialEmail,
        codeChallenge: testCodeChallenge,
      })

      const isValid = isValidToken({
        token,
        email: specialEmail,
        codeChallenge: testCodeChallenge,
        hash: hashedToken,
      })

      expect(isValid).toBe(true)
    })
  })

  describe('Integration: Full token lifecycle', () => {
    it('should create, hash, and validate a token successfully', () => {
      const email = 'user@example.com'
      const codeChallenge = 'session-codeChallenge-123'

      // Create token
      const { token, hashedToken } = createAuthToken({ email, codeChallenge })

      // Validate token
      const isValid = isValidToken({
        token,
        email,
        codeChallenge,
        hash: hashedToken,
      })

      expect(hashedToken).toBeTruthy()
      expect(isValid).toBe(true)
    })

    it('should create unique tokens for multiple users with different codeChallenges', () => {
      const users = [
        { email: 'user1@example.com', codeChallenge: 'codeChallenge-1' },
        { email: 'user2@example.com', codeChallenge: 'codeChallenge-2' },
        { email: 'user3@example.com', codeChallenge: 'codeChallenge-3' },
      ]

      const tokens = users.map(({ email, codeChallenge }) => {
        const { token, hashedToken } = createAuthToken({
          email,
          codeChallenge: codeChallenge,
        })
        return { email, codeChallenge, token, hashedToken }
      })

      // Verify each token is valid for its own email and codeChallenge
      tokens.forEach(({ email, codeChallenge, token, hashedToken }) => {
        const isValid = isValidToken({
          token,
          email,
          codeChallenge: codeChallenge,
          hash: hashedToken,
        })
        expect(isValid).toBe(true)
      })

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
        email,
        codeChallenge: codeChallenge1,
      })

      // Create token for session 2
      const { token: token2, hashedToken: hash2 } = createAuthToken({
        email,
        codeChallenge: codeChallenge2,
      })

      // Token from session 1 should not validate with codeChallenge from session 2
      const crossValidation1 = isValidToken({
        token: token1,
        email,
        codeChallenge: codeChallenge2,
        hash: hash1,
      })
      expect(crossValidation1).toBe(false)

      // Token from session 2 should not validate with codeChallenge from session 1
      const crossValidation2 = isValidToken({
        token: token2,
        email,
        codeChallenge: codeChallenge1,
        hash: hash2,
      })
      expect(crossValidation2).toBe(false)

      // But each token should still work with its own codeChallenge
      expect(
        isValidToken({
          token: token1,
          email,
          codeChallenge: codeChallenge1,
          hash: hash1,
        }),
      ).toBe(true)
      expect(
        isValidToken({
          token: token2,
          email,
          codeChallenge: codeChallenge2,
          hash: hash2,
        }),
      ).toBe(true)
    })
  })
})
