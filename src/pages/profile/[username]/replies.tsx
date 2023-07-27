import { Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { SkeletonPostList } from '~/components/SkeletonPostList'
import Suspense from '~/components/Suspense'
import { Post } from '~/features/posts/components'
import { EmptyPostList } from '~/features/profile/components'
import { type NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'
import { trpc } from '~/utils/trpc'

export const RepliesPostList = (): JSX.Element => {
  const { query } = useRouter()

  const [data] = trpc.post.repliesByUser.useSuspenseQuery({
    username: String(query.username),
  })

  if (data.posts.length === 0) {
    return (
      <EmptyPostList
        currentUserText="When you reply to a post, it'll show up here!"
        readOnlyText="This user has not replied to anything yet"
      />
    )
  }

  return (
    <Stack spacing={0} divider={<StackDivider />} py="1rem">
      {data.posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </Stack>
  )
}

const Replies: NextPageWithLayout = () => {
  return (
    <Suspense fallback={<SkeletonPostList />}>
      <RepliesPostList />
    </Suspense>
  )
}

Replies.getLayout = ProfileLayout

export default Replies
