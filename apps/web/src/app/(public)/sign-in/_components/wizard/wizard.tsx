import { SignInWizardProvider } from './context'
import { EmailFlow } from './email/email-flow'

export const SignInWizard = () => 
  (
    <SignInWizardProvider>
      <EmailFlow />
    </SignInWizardProvider>
  )

