import { Flex, Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import Link from 'next/link'
import { Avatar } from '~/components/Avatar'
import { SETTINGS_PROFILE } from '~/lib/routes'
import { RouterOutput } from '~/utils/trpc'

export interface ProfileDescriptionProps {
  profile: RouterOutput['profile']['byUsername']
  isOwnProfile: boolean
}

export const ProfileDescription = ({
  profile,
  isOwnProfile,
}: ProfileDescriptionProps): JSX.Element => {
  return (
    <Flex py="1.5rem" w="100%">
      <Stack direction="row" spacing="1.25rem" flex={1}>
        <Avatar
          name={profile?.name}
          src={profile.image}
          size="2xl"
          w="7rem"
          h="7rem"
        />
        <Stack flex={1}>
          <Stack direction="row" justify="space-between" spacing="0.5rem">
            <Stack spacing={0}>
              <Text textStyle="h6">{profile.name || profile.username}</Text>
              <Text textStyle="body-2">@{profile.username}</Text>
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
          <Text textStyle="body-2">{profile.bio}</Text>
        </Stack>
      </Stack>
    </Flex>
  )
}
