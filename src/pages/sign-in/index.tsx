import { Box, Flex, Skeleton, Text } from '@chakra-ui/react'

import { noop } from 'lodash'
import { useRouter } from 'next/router'
import Suspense from '~/components/Suspense'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { env } from '~/env.mjs'
import {
  BackgroundBox,
  BaseGridLayout,
  FooterGridArea,
  LoginGridArea,
  LoginImageSvgr,
  NonMobileSidebarGridArea,
  SignInForm,
} from '~/features/sign-in/components'
import { SignInContextProvider } from '~/features/sign-in/components/SignInContext'
import { trpc } from '~/utils/trpc'

const title = env.NEXT_PUBLIC_APP_NAME

const SignIn = () => {
  useRedirectIfSignedIn()

  return (
    <BackgroundBox>
      {/* <RestrictedGovtMasthead
      // This component can only be used if this is an application created by OGP.
      /> */}
      <BaseGridLayout flex={1}>
        <NonMobileSidebarGridArea>
          <LoginImageSvgr maxW="100%" aria-hidden />
        </NonMobileSidebarGridArea>
        <LoginGridArea>
          <Box minH={{ base: 'auto', lg: '17.25rem' }} w="100%">
            <Flex mb={{ base: '2.5rem', lg: 0 }} flexDir="column">
              <Text
                display={{ base: 'none', lg: 'initial' }}
                textStyle="responsive-heading.heavy-1280"
                mb="2.5rem"
              >
                {title}
              </Text>
              <Box display={{ base: 'initial', lg: 'none' }}>
                <Box mb={{ base: '0.75rem', lg: '1.5rem' }}>
                  <Text textStyle="h3">{title}</Text>
                </Box>
              </Box>

              <SignInContextProvider>
                <Suspense fallback={<Skeleton w="100vw" h="100vh" />}>
                  <SignInForm />
                </Suspense>
              </SignInContextProvider>
            </Flex>
          </Box>
        </LoginGridArea>
      </BaseGridLayout>
      <BaseGridLayout
        bg={{ base: 'base.canvas.brandLight', lg: 'transparent' }}
      >
        <FooterGridArea>
          {/* <RestrictedMiniFooter
          // This component can only be used if this is an application created by OGP.
        /> */}
        </FooterGridArea>
      </BaseGridLayout>
    </BackgroundBox>
  )
}

// This hook is only meant to be used in `sign-in` page
function useRedirectIfSignedIn() {
  const router = useRouter()

  const callbackUrl =
    router.query[CALLBACK_URL_KEY] !== undefined
      ? String(router.query[CALLBACK_URL_KEY])
      : '/dashboard'

  const { isLoading } = trpc.me.get.useQuery(undefined, {
    // Just stay on this page on error
    onError: noop,
    onSuccess: () => {
      router.push(callbackUrl)
    },
    // This is intentionally set to false for sign in page since we do not want the root ErrorBoundary to catch unauthorized errors
    // If we do catch it, there will be an infinite redirect to `/sign-in`
    useErrorBoundary: false,
  })

  return { isLoading }
}

export default SignIn
