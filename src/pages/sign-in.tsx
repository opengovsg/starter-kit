import { Box, Flex, Text } from '@chakra-ui/react'
import { useState } from 'react'

import ogpLogoFull from '~/assets/ogp-logo-full.svg'
import {
  BackgroundBox,
  BaseGridLayout,
  FooterGridArea,
  LoginGridArea,
  LoginImageSvgr,
  NonMobileSidebarGridArea,
  EmailInput,
  VerificationInput,
} from '~/features/sign-in/components'
import { withSessionSsr } from '~/lib/withSession'
import NextLink from 'next/link'
import { Link, RestrictedGovtMasthead } from '@opengovsg/design-system-react'
import Image from 'next/image'

const EmailSignIn = () => {
  const [email, setEmail] = useState('')
  const [showVerificationStep, setShowVerificationStep] = useState(false)

  if (showVerificationStep) {
    return <VerificationInput email={email} />
  }

  return (
    <EmailInput
      onSuccess={(email) => {
        setEmail(email)
        setShowVerificationStep(true)
      }}
    />
  )
}

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
                OGP Starter Kit
              </Text>
              <Box display={{ base: 'initial', lg: 'none' }}>
                <Box mb={{ base: '0.75rem', lg: '1.5rem' }}>
                  <Text textStyle="h3">OGP Starter Kit</Text>
                </Box>
              </Box>
              <EmailSignIn />
            </Flex>
          </Box>
        </LoginGridArea>
      </BaseGridLayout>
      <BaseGridLayout
        bg={{ base: 'base.canvas.brandLight', lg: 'transparent' }}
      >
        <FooterGridArea>
          <Text
            display="flex"
            alignItems="center"
            whiteSpace="pre"
            lineHeight="1rem"
            fontWeight={500}
            letterSpacing="0.08em"
            textTransform="uppercase"
            fontSize="0.625rem"
          >
            Built by{' '}
            <Link
              as={NextLink}
              title="To OGP homepage"
              href="https://open.gov.sg"
            >
              <Image src={ogpLogoFull} alt="OGP Logo" priority />
            </Link>
          </Text>
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
          destination: callbackUrl ?? '/dashboard',
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
