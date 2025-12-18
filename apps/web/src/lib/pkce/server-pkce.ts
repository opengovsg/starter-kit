import { createHash } from 'crypto'

import { pkceVerifierGenerator } from '~/lib/pkce/constants'

// This file hosts functions pertaining to PKCE (Proof Key for Code Exchange) as per RFC 7636
// If you need to understand PKCE, read https://datatracker.ietf.org/doc/html/rfc7636
// Do not use this for actual OAuth flows, please use a tested library instead.

// We need to split up server and browser implementations due to using crypto APIs

export function ssCreatePkceVerifier(): string {
  return pkceVerifierGenerator()
}

export function ssCreatePkceChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier).digest('base64url')
}
