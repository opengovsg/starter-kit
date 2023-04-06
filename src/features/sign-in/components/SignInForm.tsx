import { useState } from 'react'
import { EmailInput } from './Emailnput'
import { VerificationInput } from './VerificationInput'

export const SignInForm = () => {
  const [email, setEmail] = useState('')
  const [showVerificationStep, setShowVerificationStep] = useState(false)

  if (showVerificationStep) {
    return <VerificationInput email={email} />
  }

  return (
    <EmailInput
      onSuccess={(email) => {
        setEmail(email)
        setShowVerificationStep(true)
      }}
    />
  )
}
