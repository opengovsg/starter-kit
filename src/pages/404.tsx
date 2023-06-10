import { Flex, Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import Image from 'next/image'
import { useRouter } from 'next/router'

// https://nextjs.org/docs/advanced-features/custom-error-page
const Custom404 = () => {
  const router = useRouter()

  return (
    <Flex flexDirection="column" w="100%" h="$100vh">
      <Flex
        flex={1}
        bg="base.canvas.backdrop"
        align="end"
        justify="center"
        px="1rem"
      >
        <Image
          style={{ maxWidth: '100%' }}
          aria-hidden
          width="283"
          height="240"
          src="/assets/404.svg"
          alt="404 image"
        />
      </Flex>
      <Stack
        px="1rem"
        flex={1}
        flexDirection="column"
        justify="space-between"
        align="center"
        py="4.5rem"
      >
        <Stack align="center" spacing="0.75rem">
          <Text textStyle="h5" as="h1">
            This page could not be found
          </Text>
          <Button variant="link" onClick={() => router.back()}>
            Go back
          </Button>
        </Stack>
        {/* <RestrictedMiniFooter
          // This component can only be used if this is an application created by OGP.
        /> */}
      </Stack>
    </Flex>
  )
}

export default Custom404
