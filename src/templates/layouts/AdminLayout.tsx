import { Flex } from '@chakra-ui/react'
import { AppNavbar } from '~/components/AppNavbar'
import { DashSidebar } from '~/components/DashSidebar'
import { useMe } from '~/features/me/api'
import { NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '../AppGrid'

export const AdminLayout: NextPageWithLayout['getLayout'] = (page) => {
  useMe({ redirectTo: '/sign-in' })

  return (
    <Flex minH="$100vh" flexDir="column" bg="base.canvas.backdrop">
      <AppNavbar />
      <AppGrid flex={1}>
        <DashSidebar />
        <Flex gridColumn={{ md: '3/13' }} flex={1} bg="base.canvas.alt">
          {page}
        </Flex>
      </AppGrid>
    </Flex>
  )
}
