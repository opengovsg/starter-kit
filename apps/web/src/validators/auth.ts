import z from 'zod'

import { govEmailSchema } from './email'

export const OTP_LENGTH = 6
export const OTP_PREFIX_LENGTH = 3
export const PKCE_LENGTH = 128 // max length as per RFC 7636
export const PKCE_VERIFIER_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

export const validateCodeChallenge = (val: string) => {
  try {
    let base64 = val.replace(/-/g, '+').replace(/_/g, '/')

    const padding = base64.length % 4
    if (padding) {
      base64 += '='.repeat(4 - (base64.length % 4))
    }

    return atob(base64).length === 32 // SHA-256 hash is 32 bytes
  } catch {
    return false
  }
}

export const emailSignInSchema = z.object({
  email: govEmailSchema,
  codeChallenge: z.base64url().refine(validateCodeChallenge, {
    message: 'Must be a valid base64url-encoded SHA-256 hash (32 bytes)',
  }),
})

export const emailVerifyOtpSchema = z.object({
  email: govEmailSchema,
  codeVerifier: z.string().length(PKCE_LENGTH),
  token: z
    .string()
    .trim()
    .min(1, 'OTP is required.')
    .length(OTP_LENGTH, `Please enter a ${OTP_LENGTH} character OTP.`),
})
