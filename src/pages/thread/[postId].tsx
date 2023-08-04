import { Flex } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { BackBannerButton } from '~/components/BackBannerButton'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { ThreadView } from '~/features/thread/components'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { ThreadLayout } from '~/templates/layouts/ThreadLayout'

const Thread: NextPageWithLayout = () => {
  const router = useRouter()
  return (
    <Flex w="100%" flexDir="column">
      <AppGrid
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        bg="base.canvas.brand-subtle"
        py="1rem"
        px={{ base: '1rem', lg: 0 }}
      >
        <BackBannerButton
          gridColumn={APP_GRID_COLUMN}
          onClick={() => router.back()}
        >
          Back to all posts
        </BackBannerButton>
      </AppGrid>
      <AppGrid
        flex={1}
        bg="white"
        pb="2.5rem"
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        px={{ base: '1rem', lg: 0 }}
      >
        <ThreadView />
      </AppGrid>
    </Flex>
  )
}

Thread.getLayout = ThreadLayout

export default Thread
