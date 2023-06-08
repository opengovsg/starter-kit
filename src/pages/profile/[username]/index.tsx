import { Box, Stack, StackDivider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Post } from '~/features/posts/components'
import { type NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'
import { trpc } from '~/utils/trpc'

const Profile: NextPageWithLayout = () => {
  const { query, isReady } = useRouter()

  const { data, isLoading } = trpc.post.byUser.useQuery(
    { username: String(query.username) },
    { enabled: isReady }
  )

  if (isLoading) {
    return <Box>Loading....</Box>
  }

  return (
    <Stack spacing={0} divider={<StackDivider />} py="1rem">
      {data?.posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </Stack>
  )
}

Profile.getLayout = ProfileLayout

export default Profile
