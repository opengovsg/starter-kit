import { Box, Flex, Skeleton, Text } from '@chakra-ui/react'
import { RestrictedGovtMasthead } from '@opengovsg/design-system-react'
import { PublicPageWrapper } from '~/components/AuthWrappers'

import { RestrictedMiniFooter } from '~/components/RestrictedMiniFooter'
import Suspense from '~/components/Suspense'
import { env } from '~/env.mjs'
import {
  BackgroundBox,
  BaseGridLayout,
  FooterGridArea,
  LoginGridArea,
  LoginImageSvgr,
  NonMobileSidebarGridArea,
  SignInContextProvider,
  SignInForm,
} from '~/features/sign-in/components'
import { type NextPageWithLayout } from '~/lib/types'

const title = env.NEXT_PUBLIC_APP_NAME

const SignIn: NextPageWithLayout = () => {
  return (
    <PublicPageWrapper strict>
      <BackgroundBox>
        <RestrictedGovtMasthead
        // This component can only be used if this is an application created by OGP.
        />
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
            <RestrictedMiniFooter
            // This component can only be used if this is an application created by OGP.
            />
          </FooterGridArea>
        </BaseGridLayout>
      </BackgroundBox>
    </PublicPageWrapper>
  )
}

export default SignIn
