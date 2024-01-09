import { useCallback } from 'react'
import { type VfnStepData, useSignInContext } from '../SignInContext'
import { EmailInput } from './Emailnput'
import { VerificationInput } from './VerificationInput'

export const EmailLoginForm = () => {
  const { setVfnStepData, vfnStepData } = useSignInContext()

  const handleOnSuccessEmail = useCallback(
    ({ email, otpPrefix }: VfnStepData) => {
      setVfnStepData({ email, otpPrefix })
    },
    [setVfnStepData],
  )

  if (!!vfnStepData?.email) {
    return <VerificationInput />
  }

  return <EmailInput onSuccess={handleOnSuccessEmail} />
}
