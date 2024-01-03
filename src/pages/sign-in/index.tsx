import { Flex } from '@chakra-ui/react'
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
import { CurrentLoginStep } from '~/features/sign-in/components'
import { type NextPageWithLayout } from '~/lib/types'

const SignIn: NextPageWithLayout = () => {
  return (
    <PublicPageWrapper strict>
      <Flex flexDir="column" h="inherit" minH="$100vh">
        <RestrictedGovtMasthead />
        <BaseGridLayout flex={1}>
          <NonMobileSidebarGridArea>
            <LoginImageSvgr aria-hidden />
          </NonMobileSidebarGridArea>
          <LoginGridArea>
            <SignInContextProvider>
              <CurrentLoginStep />
            </SignInContextProvider>
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
