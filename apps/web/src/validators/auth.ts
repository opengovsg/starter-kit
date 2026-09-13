import { OTP_DEFAULTS, isValidCodeChallenge } from '@opengovsg/auth'
import z from 'zod'

import { govEmailSchema } from './email'

export const OTP_LENGTH = OTP_DEFAULTS.otpLength
export const OTP_PREFIX_LENGTH = OTP_DEFAULTS.otpPrefixLength
/** Fixed at the RFC 7636 maximum by `@opengovsg/auth`. */
export const PKCE_LENGTH = 128

export const emailSignInSchema = z.object({
  email: govEmailSchema,
  codeChallenge: z.base64url().refine(isValidCodeChallenge, {
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
