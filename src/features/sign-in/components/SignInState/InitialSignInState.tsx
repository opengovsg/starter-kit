import { Stack, Text } from '@chakra-ui/react'

import { EmailSignInButton } from '../Email'
import { SgidLoginButton } from '../SgidLoginButton'
import { useEnv } from '~/hooks/useEnv'

export const InitialSignInState = (): JSX.Element => {
  const {
    env: { NEXT_PUBLIC_APP_NAME: title },
  } = useEnv()

  return (
    <Stack gap="2rem" direction="column" width="100%">
      <Text color="base.content.brand" textStyle="h3-semibold">
        {title}
      </Text>
      <Stack gap="1.5rem">
        <EmailSignInButton />
        <SgidLoginButton />
      </Stack>
    </Stack>
  )
}
