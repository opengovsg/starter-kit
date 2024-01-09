import { Divider, Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { APP_GRID_COLUMN } from '~/constants/layouts'
import { ReplyToPostAction } from '~/features/posts/components'
import { trpc } from '~/utils/trpc'
import { ThreadPost } from './ThreadPost'
import { SkeletonThreadView } from './SkeletonThreadView'

export const ThreadView = (): JSX.Element | null => {
  const router = useRouter()
  const postId = String(router.query.postId)

  const { data, isLoading, isError } = trpc.post.byId.useQuery(
    { id: postId },
    {
      enabled: router.isReady,
    },
  )

  if (isLoading) {
    return <SkeletonThreadView />
  }

  if (isError) {
    void router.push('/404')
    return null
  }

  return (
    <Stack spacing={0} gridColumn={APP_GRID_COLUMN} flexDir="column" py="1rem">
      <ThreadPost post={data} />
      <ReplyToPostAction post={data} />
      <Divider />
      <Stack spacing={0} divider={<StackDivider />} py="1rem">
        {data.replies.map((r) => (
          <ThreadPost key={r.id} post={r} />
        ))}
      </Stack>
    </Stack>
  )
}
