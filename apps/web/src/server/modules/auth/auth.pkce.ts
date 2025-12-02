import { createHash } from 'crypto'
import { customAlphabet } from 'nanoid'

import { PKCE_LENGTH } from '~/validators/auth'

// This file hosts functions pertaining to PKCE (Proof Key for Code Exchange) as per RFC 7636
// If you need to understand PKCE, read https://datatracker.ietf.org/doc/html/rfc7636
// Do not use this for actual OAuth flows, please use a tested library instead.

const PKCE_VERIFIER_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
const verifierGenerator = customAlphabet(
  PKCE_VERIFIER_ALPHABET,
  PKCE_LENGTH, // max length as per RFC 7636
)

export function createPkceVerifier(): string {
  return verifierGenerator()
}

export function createPkceChallenge(codeVerifier: string): string {
  return createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  // convert to base64url manually since polyfill not working
}
