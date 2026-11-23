import { TRPCError } from '@trpc/server'
import { describe, expect, it } from 'vitest'

import { emailLoginError, otpVerifyError } from '../auth.results'

describe('auth result mapping', () => {
  it('maps a duplicate challenge to the refresh message', () => {
    const error = emailLoginError()

    expect(error).toBeInstanceOf(TRPCError)
    expect(error.message).toBe('Please refresh and try again.')
    expect(error.code).toBe('BAD_REQUEST')
  })

  it('maps each OTP failure to the existing client message', () => {
    expect(otpVerifyError({ attempts: 6, status: 'locked' }).message).toContain(
      'Wrong OTP was entered too many times'
    )
    expect(otpVerifyError({ status: 'expired' }).message).toContain(
      'Token is invalid or has expired'
    )
    expect(otpVerifyError({ status: 'invalid' }).message).toContain(
      'Token is invalid or has expired'
    )
    expect(otpVerifyError({ status: 'consumed' }).message).toContain(
      'Token is invalid or has expired'
    )
    expect(otpVerifyError({ status: 'reused' }).message).toContain(
      'Wrong OTP entered or OTP already used'
    )
  })

  it('maps a locked OTP to too many requests', () => {
    expect(otpVerifyError({ attempts: 6, status: 'locked' }).code).toBe(
      'TOO_MANY_REQUESTS'
    )
  })
})
