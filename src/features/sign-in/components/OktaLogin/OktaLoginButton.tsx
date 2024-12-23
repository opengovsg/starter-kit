import { useRouter } from 'next/router'
import { Divider, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'

import { trpc } from '~/utils/trpc'
import { getRedirectUrl } from '~/utils/url'

export const OktaLoginButton = (): JSX.Element | null => {
  const router = useRouter()
  const loginMutation = trpc.auth.okta.login.useMutation({
    onSuccess: async ({ redirectUrl }) => {
      await router.push(redirectUrl)
    },
  })

  const landingUrl = getRedirectUrl(router.query)

  const handleLogin = () => {
    return loginMutation.mutate({
      landingUrl,
    })
  }

  return (
    <>
      <HStack spacing="2.5rem">
        <Divider />
        <Text textStyle="caption-2">or</Text>
        <Divider />
      </HStack>
      <Stack gap="0.75rem">
        <Button
          colorScheme="neutral"
          height="2.75rem"
          size="xs"
          variant="outline"
          isLoading={loginMutation.isLoading}
          onClick={handleLogin}
          aria-label="Log in with Okta"
        >
          <Flex align="center" flexDirection="row" aria-hidden>
            <Text>Log in with Okta</Text>
          </Flex>
        </Button>
        <Text textStyle="caption-2">For @open.gov.sg users only</Text>
      </Stack>
    </>
  )
}
