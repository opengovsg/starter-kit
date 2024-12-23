import { Stack, Text } from '@chakra-ui/react'

import { useFeatures } from '~/components/AppProviders'
import { useEnv } from '~/hooks/useEnv'
import { EmailLoginButton } from '../EmailLogin'
import { SgidLoginButton } from '../SgidLogin'
import { OktaLoginButton } from '~/features/sign-in/components/OktaLogin'

export const InitialLoginStep = (): JSX.Element => {
  const {
    env: { NEXT_PUBLIC_APP_NAME: title },
  } = useEnv()
  const { sgid } = useFeatures()

  return (
    <Stack gap="2rem" direction="column" width="100%">
      <Text color="base.content.brand" textStyle="h3-semibold">
        {title}
      </Text>
      {!sgid ? (
        <Stack gap="1.5rem">
          <EmailLoginButton />
          <OktaLoginButton />
        </Stack>
      ) : (
        <Stack gap="1.5rem">
          <EmailLoginButton />
          <SgidLoginButton />
        </Stack>
      )}
    </Stack>
  )
}
