import { Flex, Stack, Text } from '@chakra-ui/react'
import { RestrictedFooter } from '@opengovsg/design-system-react'
import { PublicPageWrapper } from '~/components/AuthWrappers'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'

import { SgidProfileList } from '~/features/sign-in/components/SgidProfileList'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'

const SelectProfilePage: NextPageWithLayout = () => {
  return (
    <PublicPageWrapper strict>
      <Flex minH="$100vh" flexDir="column" bg="base.canvas.alt">
        <AppGrid flex={1} templateColumns={APP_GRID_TEMPLATE_COLUMN}>
          <Stack
            mt={{ base: 0, md: '2rem' }}
            mx="auto"
            gridColumn={APP_GRID_COLUMN}
            h="fit-content"
            flexDir="column"
            p="2rem"
            bg="white"
            gap="2rem"
            maxW="100vw"
            w="24.5rem"
          >
            <Text textStyle="h4" color="base.content.strong">
              Choose an account to continue
            </Text>
            <SgidProfileList />
          </Stack>
        </AppGrid>
        <RestrictedFooter appLink="" appName="" />
      </Flex>
    </PublicPageWrapper>
  )
}

export default SelectProfilePage
