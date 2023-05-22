import { useCallback } from 'react'
import { useSignInContext } from './SignInContext'
import { EmailInput } from './Emailnput'
import { VerificationInput } from './VerificationInput'

export const SignInForm = () => {
  const { showVerificationStep, setEmail, setShowVerificationStep } =
    useSignInContext()

  const handleOnSuccessEmail = useCallback(
    (email: string) => {
      setEmail(email)
      setShowVerificationStep(true)
    },
    [setEmail, setShowVerificationStep]
  )

  if (showVerificationStep) {
    return <VerificationInput />
  }

  return <EmailInput onSuccess={handleOnSuccessEmail} />
}
