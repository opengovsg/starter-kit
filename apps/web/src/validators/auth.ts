import { z } from 'zod'

import { govEmailSchema } from './email'

export const OTP_LENGTH = 8
export const OTP_PREFIX_LENGTH = 3
// max length as per RFC 7636
export const PKCE_LENGTH = 128
export const PKCE_VERIFIER_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

export const validateCodeChallenge = (val: string) => {
  try {
    let base64 = val.replaceAll('-', '+').replaceAll('_', '/')

    const padding = base64.length % 4
    if (padding) {
      base64 += '='.repeat(4 - (base64.length % 4))
    }

    // SHA-256 hash is 32 bytes
    return atob(base64).length === 32
  } catch {
    return false
  }
}

export const emailSignInSchema = z.object({
  codeChallenge: z.base64url().refine(validateCodeChallenge, {
    message: 'Must be a valid base64url-encoded SHA-256 hash (32 bytes)',
  }),
  email: govEmailSchema,
})

export const emailVerifyOtpSchema = z.object({
  codeVerifier: z.string().length(PKCE_LENGTH),
  email: govEmailSchema,
  token: z
    .string()
    .trim()
    .min(1, 'OTP is required.')
    .length(OTP_LENGTH, `Please enter a ${OTP_LENGTH} character OTP.`),
})
