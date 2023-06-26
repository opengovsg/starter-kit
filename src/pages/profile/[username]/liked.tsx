import { Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Suspense from '~/components/Suspense'
import { Post } from '~/features/posts/components'
import { EmptyPostList, SkeletonPostList } from '~/features/profile/components'
import { type NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'
import { trpc } from '~/utils/trpc'

export const LikedPostList = (): JSX.Element => {
  const { query } = useRouter()

  const [data] = trpc.post.likedByUser.useSuspenseQuery({
    username: String(query.username),
  })

  if (data.posts.length === 0) {
    return <EmptyPostList />
  }

  return (
    <>
      {data.posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </>
  )
}

const Liked: NextPageWithLayout = () => {
  return (
    <Stack spacing={0} divider={<StackDivider />} py="1rem">
      <Suspense fallback={<SkeletonPostList />}>
        <LikedPostList />
      </Suspense>
    </Stack>
  )
}

Liked.getLayout = ProfileLayout

export default Liked
