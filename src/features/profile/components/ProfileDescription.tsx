import { Flex, Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Avatar } from '~/components/Avatar'
import { useMe } from '~/features/me/api'
import { SETTINGS_PROFILE } from '~/lib/routes'
import { trpc } from '~/utils/trpc'

export interface ProfileDescriptionProps {
  username: string
}

export const ProfileDescription = ({
  username,
}: ProfileDescriptionProps): JSX.Element => {
  const { me } = useMe()
  const { isReady } = useRouter()
  const { data } = trpc.profile.byUsername.useQuery(
    { username },
    { enabled: isReady }
  )

  const isOwnProfile = useMemo(
    () => me?.username === username,
    [me?.username, username]
  )

  return (
    <Flex py="1.5rem" w="100%">
      <Stack direction="row" spacing="1.25rem" flex={1}>
        <Avatar
          name={data?.name}
          src={data?.image}
          size="2xl"
          w="7rem"
          h="7rem"
        />
        <Stack flex={1}>
          <Stack direction="row" justify="space-between" spacing="0.5rem">
            <Stack spacing={0}>
              <Text textStyle="h6">{data?.name || data?.username}</Text>
              <Text textStyle="body-2">@{data?.username}</Text>
            </Stack>
            {isOwnProfile && (
              <Button
                size="xs"
                as={Link}
                href={SETTINGS_PROFILE}
                variant="clear"
              >
                Edit Profile
              </Button>
            )}
          </Stack>
          <Text textStyle="body-2">{data?.bio}</Text>
        </Stack>
      </Stack>
    </Flex>
  )
}
