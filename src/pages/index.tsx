import { Box, Flex, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import {
  Button,
  Link,
  RestrictedFooter,
  useIsMobile,
} from '@opengovsg/design-system-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { BiRightArrowAlt } from 'react-icons/bi'
import { OgpLogo } from '~/components/Svg/OgpLogo'
import {
  AppPublicHeader,
  FeatureGridItem,
  FeatureSection,
  LandingSection,
  SectionBodyText,
  SectionHeadingText,
} from '~/features/landing/components'
import { SIGN_IN } from '~/lib/routes'
import { AppGrid } from '~/templates/AppGrid'

const LandingPage = () => {
  const isMobile = useIsMobile()
  return (
    <>
      <AppPublicHeader />
      <LandingSection
        bg="base.canvas.brand-subtle"
        pt={{ base: '2rem', md: 0 }}
        px={0}
      >
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          spacing={{ base: '1.5rem', md: '3.125rem', lg: '7.5rem' }}
        >
          <Flex flexDir="column" flex={1}>
            <Text
              as="h1"
              textStyle={{
                base: 'responsive-display.heavy',
                md: 'responsive-display.heavy-480',
              }}
              color="base.content.strong"
            >
              Build production ready applications in minutes.
            </Text>
            <SectionBodyText mt="1rem">
              StarterApp is our baseline application created by StarterKit. You
              can explore it to get a sense of basic functions and interactions.
            </SectionBodyText>
            <Box mt="2.5rem">
              <Button
                isFullWidth={isMobile}
                as={NextLink}
                href={SIGN_IN}
                rightIcon={<BiRightArrowAlt fontSize="1.5rem" />}
              >
                Explore StarterApp
              </Button>
            </Box>
          </Flex>
          <Flex flex={1} aria-hidden justify="right">
            <Image
              src="/assets/landing-banner.svg"
              alt="StarterApp hero"
              width={480}
              height={400}
            />
          </Flex>
        </Stack>
      </LandingSection>
      <LandingSection>
        <SectionHeadingText>Our application features</SectionHeadingText>
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacingX="2.5rem"
          spacingY="4rem"
          mt="4rem"
        >
          <FeatureGridItem
            // image={}
            title="Example feature 1"
            description="This is a description of one of the features in the application"
          />
          <FeatureGridItem
            // image={}
            title="Example feature 2"
            description="This is a description of one of the features in the application"
          />
          <FeatureGridItem
            // image={}
            title="Example feature 3"
            description="This is a description of one of the features in the application"
          />
        </SimpleGrid>
      </LandingSection>
      <LandingSection bg="base.canvas.brand-subtle">
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          spacing={{ base: '1.5rem', md: '3.125rem', lg: '7.5rem' }}
        >
          <Flex flexDir="column" flex={1}>
            <SectionHeadingText>Another call to action</SectionHeadingText>
            <SectionBodyText mt="1rem">
              Sign in with your email address, and start building your app
              immediately. It’s free, and requires no onboarding or approvals.
            </SectionBodyText>
            <Box mt="2.5rem">
              <Button as={NextLink} href={SIGN_IN}>
                Get started
              </Button>
            </Box>
          </Flex>
          <Box flex={1} aria-hidden>
            <Image
              src="/assets/landing-banner.svg"
              alt="StarterApp hero"
              width={480}
              height={400}
            />
          </Box>
        </Stack>
      </LandingSection>
      <FeatureSection
        title="All the government tools you need to manage your workflow"
        direction={{ base: 'column', lg: 'row' }}
      >
        <SectionBodyText mt="1rem">
          Check out the <b>Open Government Products Suite</b>, and if you are a
          public officer you can mix and match from our set of productivity and
          collaboration tools.{' '}
          <Link
            as={NextLink}
            href="https://www.open.gov.sg/products/overview"
            isExternal
            externalLinkIcon={<Icon as={BiRightArrowAlt} fontSize="1.5rem" />}
          >
            Full list of OGP products
          </Link>
        </SectionBodyText>
      </FeatureSection>
      <LandingSection bg="base.content.strong" align="center">
        <OgpLogo aria-hidden w="3.5rem" h="3.5rem" color="blue.500" />
        <Text
          textAlign="center"
          textStyle={{
            base: 'responsive-heading.heavy',
            md: 'responsive-heading.heavy-480',
          }}
          color="white"
          mt="2rem"
        >
          Start building your app now.
        </Text>
        <Box mt="2rem">
          <Button as={NextLink} href={SIGN_IN}>
            Get started
          </Button>
        </Box>
      </LandingSection>
      <AppGrid bg="base.canvas.brand-subtle" px="1.5rem">
        <Box gridColumn={{ base: '1 / -1', md: '2 / 12' }}>
          <RestrictedFooter
            // This component can only be used if this is an application created by OGP.
            containerProps={{
              px: 0,
            }}
            appName="Starter Kit"
            appLink="/"
          />
        </Box>
      </AppGrid>
    </>
  )
}

export default LandingPage
