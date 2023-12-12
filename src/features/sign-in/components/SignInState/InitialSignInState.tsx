import { Stack } from '@chakra-ui/react'

import { EmailSignInButton } from '../Email'
import { SgidLoginButton } from '../SgidLoginButton'

export const InitialSignInState = (): JSX.Element => {
  return (
    <Stack gap="2rem" direction="column" width="100%">
      <Stack gap="1.5rem">
        <EmailSignInButton />
        <SgidLoginButton />
      </Stack>
    </Stack>
  )
}
