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
  })
})
