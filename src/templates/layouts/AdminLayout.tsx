import { Box, Flex, Grid } from '@chakra-ui/react'
import { RestrictedGovtMasthead } from '@opengovsg/design-system-react'
import { AppNavbar } from '~/components/AppNavbar'
import { DashSidebar } from '~/components/DashSidebar'
import { APP_GRID_TEMPLATE_AREA } from '~/constants/layouts'
import { useMe } from '~/features/me/api'
import { type GetLayout } from '~/lib/types'

export const AdminLayout: GetLayout = (page) => {
  useMe({ redirectTo: '/sign-in' })

  return (
    <Flex minH="$100vh" flexDir="column" bg="base.canvas.alt" pos="relative">
      <Box pos="sticky" top={0} zIndex="banner" w="100%">
        <RestrictedGovtMasthead
        // This component can only be used if this is an application created by OGP.
        />
      </Box>
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
  )
}
