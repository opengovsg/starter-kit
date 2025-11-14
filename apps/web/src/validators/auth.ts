import z from 'zod'

import { govEmailSchema } from './email'

export const OTP_LENGTH = 6
export const OTP_PREFIX_LENGTH = 3

export const emailSignInSchema = z.object({
  email: govEmailSchema,
})

export const emailVerifyOtpSchema = emailSignInSchema.extend({
  token: z
    .string()
    .trim()
    .min(1, 'OTP is required.')
    .length(OTP_LENGTH, `Please enter a ${OTP_LENGTH} character OTP.`),
})
