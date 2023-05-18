import { Flex, Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { BackBannerButton } from '~/components/BackBannerButton'
import { APP_GRID_COLUMN, APP_GRID_TEMPLATE_COLUMN } from '~/constants/layouts'
import { Post } from '~/features/posts/components'
import { PostView } from '~/features/posts/components/Post/PostView'
import { ReplyToPostAction } from '~/features/posts/components/PostActions/ReplyToPostAction'
import { type NextPageWithLayout } from '~/lib/types'
import { AppGrid } from '~/templates/AppGrid'
import { ThreadLayout } from '~/templates/layouts/ThreadLayout'
import { trpc } from '~/utils/trpc'

const Thread: NextPageWithLayout = () => {
  const router = useRouter()
  const postId = String(router.query.postId)

  const { data, isLoading } = trpc.post.byId.useQuery(
    { id: postId },
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
        templateColumns={APP_GRID_TEMPLATE_COLUMN}
        py="1rem"
      >
        <Stack
          spacing={0}
          divider={<StackDivider />}
          gridColumn={APP_GRID_COLUMN}
          flexDir="column"
        >
          <PostView post={data} />
          <ReplyToPostAction post={data} />
          <Stack>
            {data.replies.map((p) => (
              <Post key={p.id} post={p} />
            ))}
          </Stack>
        </Stack>
      </AppGrid>
    </Flex>
  )
}

Thread.getLayout = ThreadLayout

export default Thread
