import { Flex } from '@chakra-ui/react'
import { AppNavbar } from '~/components/AppNavbar'
import { DashSidebar } from '~/components/DashSidebar'
import { useMe } from '~/features/me/api'
import { type GetLayout } from '~/lib/types'
import { AppGrid } from '../AppGrid'

export const AdminLayout: GetLayout = (page) => {
  useMe({ redirectTo: '/sign-in' })
  return (
    <Flex minH="$100vh" flexDir="column" bg="base.canvas.alt">
      <AppNavbar />
      <AppGrid flex={1}>
        <DashSidebar />
        <Flex gridColumn={{ md: '3 / 13' }} flex={1} bg="base.canvas.alt">
          {page}
        </Flex>
      </AppGrid>
    </Flex>
  )
}
