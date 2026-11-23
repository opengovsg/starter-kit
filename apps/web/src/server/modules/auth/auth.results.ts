import { TRPCError } from '@trpc/server'

/**
 * Domain outcome of requesting an email OTP.
 * `token` stays on the server result so the mailer can send it. The tRPC
 * procedure returns only `email` and `otpPrefix`.
 */
export type EmailLoginResult =
  | {
      status: 'sent'
      email: string
      otpPrefix: string
      token: string
    }
  | { status: 'duplicate_challenge' }

/** Domain outcome of checking an email OTP. */
export type OtpVerifyResult =
  | { status: 'verified' }
  | { status: 'locked'; attempts: number }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { status: 'reused' }
  | { status: 'consumed' }

/** tRPC error for a duplicate login challenge. */
export const emailLoginError = (): TRPCError =>
  new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Please refresh and try again.',
  })

/** tRPC error for a failed OTP check. */
export const otpVerifyError = (
  result: Exclude<OtpVerifyResult, { status: 'verified' }>
): TRPCError => {
  switch (result.status) {
    case 'locked': {
      return new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message:
          'Wrong OTP was entered too many times. Please request a new OTP.',
      })
    }

    case 'expired':
    case 'invalid':
    case 'consumed': {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Token is invalid or has expired. Please request a new OTP.',
      })
    }

    case 'reused': {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Wrong OTP entered or OTP already used, make sure to use the OTP that corresponds to the 3 character prefix.',
      })
    }

    default: {
      const unreachable: never = result

      return unreachable
    }
  }
}
