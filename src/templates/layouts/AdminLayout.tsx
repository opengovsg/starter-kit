import { Flex, Grid } from '@chakra-ui/react'
import { AppNavbar } from '~/components/AppNavbar'
import { EnforceLoginStatePageWrapper } from '~/components/AuthWrappers'
import { DashSidebar } from '~/components/DashSidebar'
import { APP_GRID_TEMPLATE_AREA } from '~/constants/layouts'
import { type GetLayout } from '~/lib/types'

export const AdminLayout: GetLayout = (page) => {
  return (
    <EnforceLoginStatePageWrapper>
      <Flex minH="$100vh" flexDir="column" bg="base.canvas.alt" pos="relative">
        <Grid
          flex={1}
          width="100vw"
          gridColumnGap={{ base: 0, md: '1rem' }}
          gridTemplate={APP_GRID_TEMPLATE_AREA}
        >
          <AppNavbar />
          <DashSidebar />
          <Flex flex={1} bg="base.canvas.alt">
            {page}
          </Flex>
        </Grid>
      </Flex>
    </EnforceLoginStatePageWrapper>
  )
}
