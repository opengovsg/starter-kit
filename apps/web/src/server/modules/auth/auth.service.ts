import { createPkceChallenge } from '@opengovsg/auth/pkce'
import type { OtpVerificationErrorCode } from '@opengovsg/auth/server/otp'
import { createOtpAuth } from '@opengovsg/auth/server/otp'
import { TRPCError } from '@trpc/server'
import { add } from 'date-fns/add'
import { format } from 'date-fns/format'

import type { Logger } from '@acme/logging'

import { sendMail } from '../mail/mail.service'
import { verificationTokenStore } from './verification-token.store'

import { env } from '~/env'
import { getBaseUrl } from '~/utils/get-base-url'

const INVALID_OR_EXPIRED_OTP_MESSAGE =
  'Token is invalid or has expired. Please request a new OTP.'

const VERIFY_OTP_ERROR_MESSAGES = {
  too_many_attempts:
    'Wrong OTP was entered too many times. Please request a new OTP.',
  // Keep not_found / expired / invalid / token_reused on one message so the
  // client cannot tell whether a record existed or which check failed.
  expired: INVALID_OR_EXPIRED_OTP_MESSAGE,
  invalid: INVALID_OR_EXPIRED_OTP_MESSAGE,
  not_found: INVALID_OR_EXPIRED_OTP_MESSAGE,
  token_reused: INVALID_OR_EXPIRED_OTP_MESSAGE,
} as const satisfies Record<
  Exclude<OtpVerificationErrorCode, 'unexpected'>,
  string
>

const otpAuth = createOtpAuth({
  store: verificationTokenStore,
  otpExpirySeconds: env.OTP_EXPIRY,
  sendOtp: async ({ email, otp, otpPrefix }) => {
    const url = new URL(getBaseUrl())
    const expiry = add(new Date(), { seconds: env.OTP_EXPIRY })
    await sendMail({
      subject: `Sign in to ${url.host}`,
      body: `Your OTP is ${otpPrefix}-<b>${otp}</b>. It will expire on ${format(
        expiry,
        'dd MMM yyyy, h:mmaaa'
      )}.
      Please use this to login to your account.
      <p>If your OTP does not work, please request for a new one.</p>`,
      recipient: email,
    })
  },
})

export const emailLogin = async ({
  email,
  codeChallenge,
}: {
  email: string
  codeChallenge: string
}) => {
  const result = await otpAuth.issueOtp({ email, codeChallenge })
  if (!result.success) {
    if (result.error.code === 'unexpected') {
      throw result.error.cause ?? result.error
    }
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Please refresh and try again.',
    })
  }

  return {
    email,
    otpPrefix: result.data.otpPrefix,
  }
}

export const emailVerifyOtp = async ({
  email,
  token,
  codeVerifier,
  logger,
}: {
  email: string
  token: string
  codeVerifier: string
  logger: Logger
}) => {
  const result = await otpAuth.verifyOtp({ email, token, codeVerifier })
  if (result.success) {
    return result.data
  }

  if (result.error.code === 'unexpected') {
    throw result.error.cause ?? result.error
  }

  if (result.error.code === 'token_reused') {
    logger.audit.authn.tokenReused({
      // Log the public challenge, never the secret verifier.
      tokenId: await createPkceChallenge(codeVerifier),
      context: { email },
    })
  } else {
    logger.audit.authn.loginFailed({
      username: email,
      privileged: true,
      reason: result.error.code,
      attemptCount: result.error.attemptCount ?? 0,
    })
  }

  throw new TRPCError({
    code:
      result.error.code === 'too_many_attempts'
        ? 'TOO_MANY_REQUESTS'
        : 'BAD_REQUEST',
    message: VERIFY_OTP_ERROR_MESSAGES[result.error.code],
  })
}
