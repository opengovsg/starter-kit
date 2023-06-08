import { Box, Flex, Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { NewPostBanner } from '~/features/home/components'
import { Post } from '~/features/posts/components'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import { trpc } from '~/utils/trpc'

const Home: NextPageWithLayout = () => {
  const router = useRouter()

  const { data, isLoading } = trpc.post.list.useQuery(
    {},
    { enabled: router.isReady }
  )

  if (isLoading || !data) {
    return <div>Loading...</div>
  }

  return (
    <Flex w="100%" flexDir="column">
      <AppGrid
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        bg="base.canvas.brand-subtle"
        py="1rem"
      >
        <Box gridColumn={APP_GRID_COLUMN}>
          <NewPostBanner />
        </Box>
      </AppGrid>
      <AppGrid flex={1} bg="white" templateColumns={APP_GRID_TEMPLATE_COLUMN}>
        <Stack
          spacing={0}
          divider={<StackDivider />}
          gridColumn={APP_GRID_COLUMN}
          flexDir="column"
        >
          {data.items.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </Stack>
      </AppGrid>
    </Flex>
  )
}

Home.getLayout = AdminLayout

export default Home
