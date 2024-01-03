import { Stack, Text } from '@chakra-ui/react'

import { SgidLoginButton } from '../SgidLogin'
import { EmailLoginButton, EmailLoginForm } from '../EmailLogin'
import { useEnv } from '~/hooks/useEnv'
import { useFeatures } from '~/components/AppProviders'

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
        <EmailLoginForm />
      ) : (
        <Stack gap="1.5rem">
          <EmailLoginButton />
          <SgidLoginButton />
        </Stack>
      )}
    </Stack>
  )
}
