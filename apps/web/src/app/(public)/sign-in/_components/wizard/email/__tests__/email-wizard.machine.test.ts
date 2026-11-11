import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createActor } from 'xstate'

import { emailWizardMachine } from '../email-wizard.machine'

import { PKCE_LENGTH } from '~/validators/auth'

const sampleVfnData = {
  codeVerifier: 'v'.repeat(PKCE_LENGTH),
  email: 'user@gov.sg',
  otpPrefix: 'ABCD',
}

const startActor = (delayForResendSeconds = 3) =>
  createActor(emailWizardMachine, {
    input: { delayForResendSeconds },
  }).start()

describe('signInEmailWizard machine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('advances to verify on OTP_SENT', () => {
    const actor = startActor()

    expect(actor.getSnapshot().matches('email')).toBeTruthy()

    actor.send({ data: sampleVfnData, type: 'OTP_SENT' })

    const snapshot = actor.getSnapshot()

    expect(snapshot.matches('verify')).toBeTruthy()
    expect(snapshot.context.vfnStepData).toStrictEqual(sampleVfnData)
  })

  it('counts down the resend timer, then allows resend', () => {
    const actor = startActor(3)

    actor.send({ data: sampleVfnData, type: 'OTP_SENT' })
    vi.advanceTimersByTime(2000)

    expect(actor.getSnapshot().context.resendTimer).toBe(1)
    expect(actor.getSnapshot().matches({ verify: 'cooldown' })).toBeTruthy()

    vi.advanceTimersByTime(1000)

    expect(actor.getSnapshot().context.resendTimer).toBe(0)
    expect(actor.getSnapshot().matches({ verify: 'canResend' })).toBeTruthy()
  })

  it('restarts the timer and updates step data on OTP_RESENT', () => {
    const actor = startActor(3)
    const resent = { ...sampleVfnData, otpPrefix: 'WXYZ' }

    actor.send({ data: sampleVfnData, type: 'OTP_SENT' })
    vi.advanceTimersByTime(3000)
    actor.send({ data: resent, type: 'OTP_RESENT' })

    const snapshot = actor.getSnapshot()

    expect(snapshot.matches({ verify: 'cooldown' })).toBeTruthy()
    expect(snapshot.context.resendTimer).toBe(3)
    expect(snapshot.context.vfnStepData).toStrictEqual(resent)
  })

  it('returns to email and clears step data on VERIFIED', () => {
    const actor = startActor()

    actor.send({ data: sampleVfnData, type: 'OTP_SENT' })
    actor.send({ type: 'VERIFIED' })

    const snapshot = actor.getSnapshot()

    expect(snapshot.matches('email')).toBeTruthy()
    expect(snapshot.context.vfnStepData).toBeUndefined()
  })
})
