import {
  ssCreatePkceChallenge,
  ssCreatePkceVerifier,
} from '~/lib/pkce/server-pkce'
import { validateCodeChallenge } from '~/validators/auth'

describe('auth', () => {
  describe('validateCodeChallenge', () => {
    it('should successfully validate our generated code challenges', () => {
      for (let i = 0; i < 10000; i++) {
        const verifier = ssCreatePkceVerifier()
        const challenge = ssCreatePkceChallenge(verifier)
        const validationResult = validateCodeChallenge(challenge)
        expect(validationResult).toBeTruthy()
      }
    })
  })
})
