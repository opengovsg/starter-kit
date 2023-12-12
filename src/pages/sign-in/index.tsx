import { Box, Flex, Text } from '@chakra-ui/react'
import { RestrictedGovtMasthead } from '@opengovsg/design-system-react'
import { PublicPageWrapper } from '~/components/AuthWrappers'

import { RestrictedMiniFooter } from '~/components/RestrictedMiniFooter'
import {
  BaseGridLayout,
  FooterGridArea,
  LoginGridArea,
  LoginImageSvgr,
  NonMobileFooterLeftGridArea,
  NonMobileSidebarGridArea,
  SignInContextProvider,
} from '~/features/sign-in/components'
import { useEnv } from '~/hooks/useEnv'
import { CurrentSignInState } from '~/features/sign-in/components/SignInState'
import { type NextPageWithLayout } from '~/lib/types'

const SignIn: NextPageWithLayout = () => {
  const {
    env: { NEXT_PUBLIC_APP_NAME: title },
  } = useEnv()

  return (
    <PublicPageWrapper strict>
      <Flex flexDir="column" h="inherit" minH="$100vh">
        <RestrictedGovtMasthead />
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
                  <CurrentSignInState />
                </SignInContextProvider>
              </Flex>
            </Box>
          </LoginGridArea>
          <NonMobileFooterLeftGridArea />
          <FooterGridArea>
            <RestrictedMiniFooter />
          </FooterGridArea>
        </BaseGridLayout>
      </Flex>
    </PublicPageWrapper>
  )
}

export default SignIn
