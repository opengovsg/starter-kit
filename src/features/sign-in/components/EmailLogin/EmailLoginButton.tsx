import { Button } from '@opengovsg/design-system-react'
import { useSignInContext } from '../SignInContext'

export const EmailLoginButton = (): JSX.Element | null => {
  const { proceedToEmail } = useSignInContext()

  return (
    <Button
      size="xs"
      variant="solid"
      onClick={proceedToEmail}
      aria-label="Log in with email address"
      height="2.75rem"
    >
      Log in with email address
    </Button>
  )
}
