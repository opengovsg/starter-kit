import { Box, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useMe } from '~/features/me/api'

export const EmptyPostList = (): JSX.Element => {
  const { query } = useRouter()
  const username = String(query.username)

  const { me } = useMe()

  const isLoggedInProfile = me?.username === username

  return (
    <Box>
      <Text textStyle="subhead-2">
        {isLoggedInProfile
          ? 'You have not posted anything yet. Start now!'
          : 'This user has not posted anything yet'}
      </Text>
    </Box>
  )
}
