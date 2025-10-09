import { SignInWizardProvider } from './context'
import { EmailFlow } from './email'

export const SignInWizard = () => {
  return (
    <SignInWizardProvider>
      <EmailFlow />
    </SignInWizardProvider>
  )
}
