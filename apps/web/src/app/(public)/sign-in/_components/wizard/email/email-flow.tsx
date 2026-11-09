'use client'

import { useSignInWizard } from '../context'
import type { VfnStepData } from '../types'
import { EmailStep } from './email-step'
import { VerificationStep } from './verification-step'

export const EmailFlow = () => {
  const { advanceToVerify, wizardStep } = useSignInWizard()

  const handleOnSuccessEmail = (data: VfnStepData) => {
    advanceToVerify(data)
  }

  if (wizardStep === 'verify') {
    return <VerificationStep />
  }

  return <EmailStep onNext={handleOnSuccessEmail} />
}
