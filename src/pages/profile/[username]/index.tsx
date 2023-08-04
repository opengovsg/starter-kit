import { Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { SkeletonPostList } from '~/components/SkeletonPostList'
import Suspense from '~/components/Suspense'
import { Post } from '~/features/posts/components'
import { EmptyPostList } from '~/features/profile/components'
import { type NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'
import { trpc } from '~/utils/trpc'

export const ProfilePostList = (): JSX.Element => {
  const { query } = useRouter()

  const [data] = trpc.post.byUser.useSuspenseQuery({
    username: String(query.username),
  })

  if (data.posts.length === 0) {
    return (
      <EmptyPostList
        currentUserText="You have not posted anything yet. Start now!"
        readOnlyText="This user has not posted anything yet"
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

const Profile: NextPageWithLayout = () => {
  return (
    <Suspense fallback={<SkeletonPostList />}>
      <ProfilePostList />
    </Suspense>
  )
}

Profile.getLayout = ProfileLayout

export default Profile
