import { Flex } from '@chakra-ui/react'
import { AppNavbar } from '~/components/AppNavbar'
import { DashSidebar } from '~/components/DashSidebar'
import { useUser } from '~/features/profile/api'
import { type NextPageWithLayout } from '~/lib/types'

export const AdminLayout: NextPageWithLayout['getLayout'] = (page) => {
  useUser({ redirectTo: '/sign-in' })

  return (
    <Flex minH="$100vh" flexDir="column">
      <AppNavbar />
      <Flex flex={1}>
        <DashSidebar />
        <Flex flex={1} bg="base.canvas.alt">
          {page}
        </Flex>
      </Flex>
    </Flex>
  )
}
