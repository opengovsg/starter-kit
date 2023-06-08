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
      <AppGrid
        flex={1}
        columnGap={{ base: 0, md: '0.5rem', lg: '1rem' }}
        templateColumns={{ base: '2.75rem 1fr', md: 'repeat(12, 1fr)' }}
      >
        <DashSidebar />
        <Flex
          gridColumn={{ base: '2', md: '3 / 13' }}
          flex={1}
          bg="base.canvas.alt"
        >
          {page}
        </Flex>
      </AppGrid>
    </Flex>
  )
}
