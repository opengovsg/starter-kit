import { z } from 'zod'
import { OTP_LENGTH } from '~/lib/auth'
import { normaliseEmail } from '~/utils/zod'

export const emailSignInSchema = z.object({
  email: normaliseEmail,
})

export const emailVerifyOtpSchema = emailSignInSchema.extend({
  token: z
    .string()
    .trim()
    .min(1, 'OTP is required.')
    .length(OTP_LENGTH, `Please enter a ${OTP_LENGTH} character OTP.`),
})
