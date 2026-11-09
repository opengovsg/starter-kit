import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'

import { emailWizardMachine } from '../email-wizard.machine'

const sampleVfnData = {
  codeChallenge: 'challenge',
  email: 'user@gov.sg',
  otpPrefix: 'ABCD',
}

describe('signInEmailWizard machine', () => {
  it('starts on email and advances to verify', () => {
    const actor = createActor(emailWizardMachine, {
      input: { delayForResendSeconds: 60 },
    })

    actor.start()

    expect(actor.getSnapshot().matches('email')).toBeTruthy()

    actor.send({ data: sampleVfnData, type: 'ADVANCE_TO_VERIFY' })

    const snapshot = actor.getSnapshot()

    expect(snapshot.matches('verify')).toBeTruthy()
    expect(snapshot.context.vfnStepData).toStrictEqual(sampleVfnData)
    expect(snapshot.context.resendTimer).toBe(60)
  })

  it('blocks duplicate BEGIN_VERIFY while in flight', () => {
    const actor = createActor(emailWizardMachine, {
      input: { delayForResendSeconds: 60 },
    })

    actor.start()

    actor.send({ data: sampleVfnData, type: 'ADVANCE_TO_VERIFY' })
    actor.send({ type: 'BEGIN_VERIFY' })

    expect(actor.getSnapshot().context.verifyInFlight).toBeTruthy()

    actor.send({ type: 'BEGIN_VERIFY' })

    expect(actor.getSnapshot().context.verifyInFlight).toBeTruthy()
  })

  it('clears verify in flight on END_VERIFY', () => {
    const actor = createActor(emailWizardMachine, {
      input: { delayForResendSeconds: 60 },
    })

    actor.start()

    actor.send({ data: sampleVfnData, type: 'ADVANCE_TO_VERIFY' })
    actor.send({ type: 'BEGIN_VERIFY' })
    actor.send({ type: 'END_VERIFY' })

    expect(actor.getSnapshot().context.verifyInFlight).toBeFalsy()
  })

  it('returns to email on VERIFY_COMPLETE', () => {
    const actor = createActor(emailWizardMachine, {
      input: { delayForResendSeconds: 60 },
    })

    actor.start()

    actor.send({ data: sampleVfnData, type: 'ADVANCE_TO_VERIFY' })
    actor.send({ type: 'VERIFY_COMPLETE' })

    const snapshot = actor.getSnapshot()

    expect(snapshot.matches('email')).toBeTruthy()
    expect(snapshot.context.vfnStepData).toBeUndefined()
  })
})
