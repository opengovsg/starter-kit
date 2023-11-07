import { Box, Divider, Flex } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { ProfileDescription, ProfileTabs } from '~/features/profile/components'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '../AppGrid'
import { AdminLayout } from './AdminLayout'
import { nestLayout } from './nestLayout'

const _ProfileLayout: NextPageWithLayout['getLayout'] = (page) => {
  const { query } = useRouter()
  const username = String(query.username)

  return (
    <Flex
      w="100%"
      flexDir="column"
      position={{ base: 'absolute', sm: 'inherit' }}
      left={{ base: 0, sm: undefined }}
    >
      <AppGrid
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        bg="base.canvas.brand-subtle"
        px={{ base: '1rem', lg: 0 }}
      >
        <Box gridColumn={APP_GRID_COLUMN}>
          <ProfileDescription username={username} />
        </Box>
      </AppGrid>
      <AppGrid
        flex={1}
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        templateRows="min-content 1px auto"
        bg="white"
        px={{ base: '1rem', lg: 0 }}
      >
        <Box gridColumn={APP_GRID_COLUMN}>
          <ProfileTabs username={username} />
        </Box>
        <Divider gridColumn={{ base: '1/5', md: '1/12' }} h="1px" />
        <Box gridColumn={APP_GRID_COLUMN} minH="100%">
          {page}
        </Box>
      </AppGrid>
    </Flex>
  )
}

export const ProfileLayout = nestLayout(AdminLayout, _ProfileLayout)
