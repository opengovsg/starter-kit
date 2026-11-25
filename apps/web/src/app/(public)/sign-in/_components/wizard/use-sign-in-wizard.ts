import { useContext } from 'react'

import { SignInWizardContext } from './sign-in-state'

export const useSignInWizard = () => {
  const context = useContext(SignInWizardContext)

  if (context === undefined) {
    throw new Error(
      `useSignInWizard must be used within a SignInWizardProvider.`
    )
  }

  return context
}
