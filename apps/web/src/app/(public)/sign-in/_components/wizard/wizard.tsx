import { EmailFlow } from './email/email-flow'
import { EmailWizard } from './email/email-wizard.context'

export const SignInWizard = () => (
  <EmailWizard.Provider>
    <EmailFlow />
  </EmailWizard.Provider>
)
