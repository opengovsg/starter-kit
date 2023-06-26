import { Flex, Text, Wrap } from '@chakra-ui/react'
import { Tile } from '@opengovsg/design-system-react'
import { LandingFeature, LandingBuilder } from '~/components/Svg'
import { APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

const Home: NextPageWithLayout = () => {
  return (
    <Flex w="100%" flexDir="column">
      <AppGrid flex={1} bg="white" templateColumns={APP_GRID_TEMPLATE_COLUMN}>
        <Flex
          gridColumn="1/-1"
          py="1.5rem"
          px="1rem"
          justify="flex-start"
          align="center"
          flexDirection="column"
        >
          <Text textStyle="subhead-1" mb="2rem">
            Now that you’ve set up the StarterApp, here’s what you can do next:
          </Text>
          <Wrap justify="center">
            <Tile
              variant="simple"
              width="15rem"
              maxWidth="100%"
              as="a"
              target="_blank"
              href="https://start.open.gov.sg/"
              rel="noopener noreferrer"
            >
              <Flex
                justify="space-between"
                gap="1.5rem"
                flexDir="column"
                height="100%"
              >
                <Flex gap="0.25rem" flexDir="column">
                  <Text textStyle="subhead-2">Check out StarterKit docs</Text>
                  <Text textStyle="caption-2">Start adding new features</Text>
                </Flex>
                <LandingFeature />
              </Flex>
            </Tile>
            <Tile
              variant="simple"
              width="15rem"
              maxWidth="100%"
              position="relative"
              as="a"
              target="_blank"
              href="https://open-tweets.vercel.app/"
              rel="noopener noreferrer"
            >
              <Flex
                justify="space-between"
                gap="1.5rem"
                flexDir="column"
                height="100%"
              >
                <Flex gap="0.25rem" flexDir="column">
                  <Text textStyle="subhead-2">Explore our ExampleApp</Text>
                  <Text textStyle="caption-2">
                    See how we built a Twitter clone with the StarterKit
                  </Text>
                </Flex>
                <LandingBuilder />
              </Flex>
            </Tile>
            <Tile
              variant="simple"
              width="15rem"
              maxWidth="100%"
              position="relative"
              as="a"
              target="_blank"
              href="https://github.com/opengovsg/starter-kit/tree/twitter-clone-pivot"
              rel="noopener noreferrer"
            >
              <Flex
                justify="space-between"
                gap="1.5rem"
                flexDir="column"
                height="100%"
              >
                <Flex gap="0.25rem" flexDir="column">
                  <Text textStyle="subhead-2">
                    Explore ExampleApp&apos;s code
                  </Text>
                  <Text textStyle="caption-2">
                    See examples on how to write code with the StarterKit
                  </Text>
                </Flex>
                <LandingBuilder />
              </Flex>
            </Tile>
          </Wrap>
        </Flex>
      </AppGrid>
    </Flex>
  )
}

Home.getLayout = AdminLayout

export default Home
