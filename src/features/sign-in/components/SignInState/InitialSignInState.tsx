import { Stack, Text } from '@chakra-ui/react'

import { EmailSignInButton } from '../Email'
import { SgidLoginButton } from '../SgidLoginButton'
import { env } from '~/env.mjs'

const title = env.NEXT_PUBLIC_APP_NAME

export const InitialSignInState = (): JSX.Element => {
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
