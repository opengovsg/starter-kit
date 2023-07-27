import { Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { SkeletonPostList } from '~/components/SkeletonPostList'
import Suspense from '~/components/Suspense'
import { Post } from '~/features/posts/components'
import { EmptyPostList } from '~/features/profile/components'
import { type NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'
import { trpc } from '~/utils/trpc'

export const LikedPostList = (): JSX.Element => {
  const { query } = useRouter()

  const [data] = trpc.post.likedByUser.useSuspenseQuery({
    username: String(query.username),
  })

  if (data.posts.length === 0) {
    return (
      <EmptyPostList
        currentUserText="When you like a post, it'll show up here!"
        readOnlyText="This user has not liked anything yet"
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

const Liked: NextPageWithLayout = () => {
  return (
    <Suspense fallback={<SkeletonPostList />}>
      <LikedPostList />
    </Suspense>
  )
}

Liked.getLayout = ProfileLayout

export default Liked
