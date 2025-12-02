import z from 'zod'

import { govEmailSchema } from './email'

export const OTP_LENGTH = 6
export const OTP_PREFIX_LENGTH = 3
export const PKCE_LENGTH = 128

export const emailSignInSchema = z.object({
  email: govEmailSchema,
  codeChallenge: z.base64url().refine((val) => {
      try {
        return Buffer.from(val, 'base64url').length === 32; // SHA-256 hash is 32 bytes
      } catch {
        return false;
      }
    },
    {
      message: 'Must be a valid base64-encoded SHA-256 hash (32 bytes)',
    })
})

export const emailVerifyOtpSchema = z.object({
  email: govEmailSchema,
  codeVerifier: z.string().length(PKCE_LENGTH),
  token:
    z
      .string()
      .trim()
      .min(1, 'OTP is required.')
      .length(OTP_LENGTH, `Please enter a ${OTP_LENGTH} character OTP.`),
})
