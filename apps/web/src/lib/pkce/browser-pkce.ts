import { pkceVerifierGenerator } from '~/lib/pkce/constants'

// This file hosts functions pertaining to PKCE (Proof Key for Code Exchange) as per RFC 7636
// If you need to understand PKCE, read https://datatracker.ietf.org/doc/html/rfc7636
// Do not use this for actual OAuth flows, please use a tested library instead.

// We need to split up server and browser implementations due to using crypto APIs

export function browserCreatePkceVerifier(): string {
  return pkceVerifierGenerator()
}

export async function browserCreatePkceChallenge(
  codeVerifier: string,
): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const base64 = btoa(String.fromCharCode(...hashArray))

  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
