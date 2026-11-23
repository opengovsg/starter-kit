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

/**
 * Domain outcome of checking an email OTP.
 * User-facing copy is chosen in {@link throwIfOtpVerifyFailed}, not here,
 * so expired and mismatched codes can stay distinct for audit logs.
 */
export type OtpVerifyResult =
  | { status: 'verified' }
  | { status: 'locked'; attempts: number }
  | { status: 'expired' }
  | { status: 'invalid' }
  | { status: 'reused' }
  | { status: 'consumed' }

const INVALID_OR_EXPIRED_MESSAGE =
  'Token is invalid or has expired. Please request a new OTP.'

const REUSED_MESSAGE =
  'Wrong OTP entered or OTP already used, make sure to use the OTP that corresponds to the 3 character prefix.'

const DUPLICATE_CHALLENGE_MESSAGE = 'Please refresh and try again.'

const LOCKED_MESSAGE =
  'Wrong OTP was entered too many times. Please request a new OTP.'

/** tRPC error for a duplicate login challenge. */
export const emailLoginError = (
  _result: Extract<EmailLoginResult, { status: 'duplicate_challenge' }>
): TRPCError =>
  new TRPCError({
    code: 'BAD_REQUEST',
    message: DUPLICATE_CHALLENGE_MESSAGE,
  })

const invalidOrExpired = () =>
  new TRPCError({
    code: 'BAD_REQUEST',
    message: INVALID_OR_EXPIRED_MESSAGE,
  })

/** tRPC error for a failed OTP check. */
export const otpVerifyError = (
  result: Exclude<OtpVerifyResult, { status: 'verified' }>
): TRPCError => {
  switch (result.status) {
    case 'locked': {
      return new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: LOCKED_MESSAGE,
      })
    }

    case 'expired': {
      return invalidOrExpired()
    }

    case 'invalid': {
      return invalidOrExpired()
    }

    case 'consumed': {
      return invalidOrExpired()
    }

    case 'reused': {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message: REUSED_MESSAGE,
      })
    }

    default: {
      const unreachable: never = result

      return unreachable
    }
  }
}
