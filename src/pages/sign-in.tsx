import { Box, Flex, Text } from '@chakra-ui/react'

import { RestrictedGovtMasthead } from '@opengovsg/design-system-react'
import { browserEnv } from '~/browserEnv'
import { MiniFooter } from '~/components/Footer/MiniFooter'
import {
  BackgroundBox,
  BaseGridLayout,
  FooterGridArea,
  LoginGridArea,
  LoginImageSvgr,
  NonMobileSidebarGridArea,
  SignInForm,
} from '~/features/sign-in/components'
import { HOME } from '~/lib/routes'
import { withSessionSsr } from '~/lib/withSession'

const title = browserEnv.NEXT_PUBLIC_APP_NAME

const SignIn = () => {
  return (
    <BackgroundBox>
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
              <SignInForm />
            </Flex>
          </Box>
        </LoginGridArea>
      </BaseGridLayout>
      <BaseGridLayout
        bg={{ base: 'base.canvas.brandLight', lg: 'transparent' }}
      >
        <FooterGridArea>
          <MiniFooter />
        </FooterGridArea>
      </BaseGridLayout>
    </BackgroundBox>
  )
}

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req, query }) {
    const { callbackUrl } = query
    const user = req.session.user

    if (user) {
      return {
        redirect: {
          destination: callbackUrl ?? HOME,
        },
        props: {},
      }
    }

    return {
      props: {},
    }
  }
)

export default SignIn
