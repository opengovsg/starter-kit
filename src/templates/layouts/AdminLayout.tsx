import { Flex } from '@chakra-ui/react'
import { AppNavbar } from '~/components/AppNavbar'
import { EnforceLoginStatePageWrapper } from '~/components/AuthWrappers'
import { type GetLayout } from '~/lib/types'

export const AdminLayout: GetLayout = (page) => {
  return (
    <EnforceLoginStatePageWrapper>
      <Flex minH="$100vh" flexDir="column" bg="base.canvas.alt" pos="relative">
        <AppNavbar />
        <Flex flex={1} bg="base.canvas.alt">
          {page}
        </Flex>
      </Flex>
    </EnforceLoginStatePageWrapper>
  )
}
