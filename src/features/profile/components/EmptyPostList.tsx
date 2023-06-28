import { Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { BusStop } from '~/components/Svg/BusStop'
import { useMe } from '~/features/me/api'

interface EmptyPostListProps {
  currentUserText: string
  readOnlyText: string
}

export const EmptyPostList = ({
  currentUserText,
  readOnlyText,
}: EmptyPostListProps): JSX.Element => {
  const { query } = useRouter()
  const username = String(query.username)

  const { me } = useMe()

  const isLoggedInProfile = me?.username === username

  return (
    <Stack spacing="2rem" align="center" pt="3rem">
      <Text textStyle="subhead-2">
        {isLoggedInProfile ? currentUserText : readOnlyText}
      </Text>
      <BusStop />
    </Stack>
  )
}
