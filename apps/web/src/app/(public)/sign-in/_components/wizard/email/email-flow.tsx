'use client'

import type { VfnStepData } from '../context'
import { useSignInWizard } from '../context'
import { EmailStep } from './email-step'
import { VerificationStep } from './verification-step'

export const EmailFlow = () => {
  const { setVfnStepData, vfnStepData } = useSignInWizard()

  const handleOnSuccessEmail = ({
    email,
    otpPrefix,
    codeChallenge,
  }: VfnStepData) => {
    setVfnStepData({ email, otpPrefix, codeChallenge })
  }

  if (vfnStepData?.email) {
    return <VerificationStep />
  }

  return <EmailStep onNext={handleOnSuccessEmail} />
}
