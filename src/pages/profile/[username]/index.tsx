import { Box, Stack, StackDivider, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Tweet } from '~/features/tweet/Tweet'
import { NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'
import { trpc } from '~/utils/trpc'

const Profile: NextPageWithLayout = () => {
  const { query, isReady } = useRouter()

  const { data, isLoading } = trpc.post.byUser.useQuery(
    {
      username: String(query.username),
    },
    { enabled: isReady }
  )

  if (isLoading) {
    return <Box>Loading....</Box>
  }

  return (
    <Stack spacing={0} divider={<StackDivider />}>
      {data?.posts.map((p) => (
        <Tweet key={p.id} tweet={p} />
      ))}
    </Stack>
  )
}

Profile.getLayout = ProfileLayout

export default Profile
