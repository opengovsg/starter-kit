import { isValidCodeChallenge } from '@opengovsg/auth'
import { createPkceChallenge, createPkceVerifier } from '@opengovsg/auth/pkce'

describe('auth', () => {
  describe('isValidCodeChallenge', () => {
    it('should successfully validate our generated code challenges', async () => {
      for (let i = 0; i < 10000; i++) {
        const verifier = createPkceVerifier()
        const challenge = await createPkceChallenge(verifier)
        expect(isValidCodeChallenge(challenge)).toBeTruthy()
      }
    })
  })
})
