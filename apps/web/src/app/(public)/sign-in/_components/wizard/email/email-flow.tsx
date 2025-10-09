'use client'

import { useCallback } from 'react'

import type { VfnStepData } from '../context'
import { useSignInWizard } from '../context'
import { EmailStep } from './email-step'
import { VerificationStep } from './verification-step'

export const EmailFlow = () => {
  const { setVfnStepData, vfnStepData } = useSignInWizard()

  const handleOnSuccessEmail = useCallback(
    ({ email, otpPrefix }: VfnStepData) => {
      setVfnStepData({ email, otpPrefix })
    },
    [setVfnStepData],
  )

  if (vfnStepData?.email) {
    return <VerificationStep />
  }

  return <EmailStep onNext={handleOnSuccessEmail} />
}
