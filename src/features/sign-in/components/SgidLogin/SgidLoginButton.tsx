import { Button } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { trpc } from '~/utils/trpc'
import { Box, Divider, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { SingpassFullLogo } from '~/components/Svg/SingpassFullLogo'
import { getRedirectUrl } from '~/utils/url'

export const SgidLoginButton = (): JSX.Element | null => {
  const router = useRouter()
  const sgidLoginMutation = trpc.auth.sgid.login.useMutation({
    onSuccess: async ({ redirectUrl }) => {
      await router.push(redirectUrl)
    },
  })

  const landingUrl = getRedirectUrl(router.query)

  const handleSgidLogin = () => {
    return sgidLoginMutation.mutate({
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
          isLoading={sgidLoginMutation.isLoading}
          onClick={handleSgidLogin}
          aria-label="Log in with Singpass app"
        >
          <Flex align="center" flexDirection="row" aria-hidden>
            <Text>Log in with </Text>
            {/* Negative margin so the svg sits on the same line as the text */}
            <Box mb="-3px">
              <SingpassFullLogo height="1rem" />
            </Box>
            <Text> app</Text>
          </Flex>
        </Button>
        <Text textStyle="caption-2">For whitelisted government users only</Text>
      </Stack>
    </>
  )
}
