'use client'

import { EmailStep } from './email-step'
import { EmailWizard } from './email-wizard.context'
import { VerificationStep } from './verification-step'

export const EmailFlow = () => {
  const actorRef = EmailWizard.useActorRef()

  const isVerifyStep = EmailWizard.useSelector((state) =>
    state.matches('verify')
  )

  if (isVerifyStep) {
    return <VerificationStep />
  }

  return (
    <EmailStep
      onNext={(data) => {
        actorRef.send({ data, type: 'OTP_SENT' })
      }}
    />
  )
}
