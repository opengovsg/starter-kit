import { expect, describe, it } from 'vitest'

import {
  ssCreatePkceChallenge,
  ssCreatePkceVerifier,
} from '~/lib/pkce/server-pkce'
import { emailSignInSchema } from '~/validators/auth'

describe('auth', () => {
  describe('code challenge', () => {
    it('should successfully validate our generated code challenges', () => {
      const { codeChallenge } = emailSignInSchema.shape

      const results = Array.from({ length: 10_000 }, () => {
        const verifier = ssCreatePkceVerifier()
        const challenge = ssCreatePkceChallenge(verifier)

        return codeChallenge.safeParse(challenge).success
      })

      expect(results.every(Boolean)).toBeTruthy()
    })

    const valid = ssCreatePkceChallenge(ssCreatePkceVerifier())

    it.each([
      ['padded', `${valid}=`],
      ['too long', `${valid}A`],
      ['too short', valid.slice(1)],
      ['standard base64 +', `+${valid.slice(1)}`],
      ['standard base64 /', `/${valid.slice(1)}`],
      ['hex encoded', 'a'.repeat(64)],
    ])('should reject a %s challenge', (_, challenge) => {
      const result = emailSignInSchema.shape.codeChallenge.safeParse(challenge)

      expect(result.error?.issues[0]?.message).toBe(
        'Must be a valid base64url-encoded SHA-256 hash (32 bytes)'
      )
    })
  })
})
