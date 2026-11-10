import { expect, describe, it } from 'vitest'

import {
  ssCreatePkceChallenge,
  ssCreatePkceVerifier,
} from '~/lib/pkce/server-pkce'
import { validateCodeChallenge } from '~/validators/auth'

describe('auth', () => {
  describe(validateCodeChallenge, () => {
    it('should successfully validate our generated code challenges', () => {
      const results = Array.from({ length: 10_000 }, () => {
        const verifier = ssCreatePkceVerifier()
        const challenge = ssCreatePkceChallenge(verifier)

        return validateCodeChallenge(challenge)
      })

      expect(results.every(Boolean)).toBeTruthy()
    })
  })
})
