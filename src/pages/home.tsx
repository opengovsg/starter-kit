import { Flex, Stack, StackDivider, Text } from '@chakra-ui/react'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

const Home: NextPageWithLayout = () => {
  return (
    <Flex w="100%" flexDir="column">
      <AppGrid flex={1} bg="white" templateColumns={APP_GRID_TEMPLATE_COLUMN}>
        <Stack
          spacing={0}
          divider={<StackDivider />}
          gridColumn={APP_GRID_COLUMN}
          flexDir="column"
        >
          <Text>Start hacking!</Text>
          <Text>View example applications here</Text>
        </Stack>
      </AppGrid>
    </Flex>
  )
}

Home.getLayout = AdminLayout

export default Home
