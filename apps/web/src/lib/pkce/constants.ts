import { customAlphabet } from 'nanoid'

import { PKCE_LENGTH, PKCE_VERIFIER_ALPHABET } from '~/validators/auth'

export const pkceVerifierGenerator = customAlphabet(
  PKCE_VERIFIER_ALPHABET,
  PKCE_LENGTH,
)
