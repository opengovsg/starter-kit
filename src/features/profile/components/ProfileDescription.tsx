import { Flex, Grid, Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import Link from 'next/link'
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
  const [data] = trpc.profile.byUsername.useSuspenseQuery({ username })

  const isOwnProfile = useMemo(
    () => me?.username === username,
    [me?.username, username],
  )

  return (
    <Flex py="1.5rem" w="100%">
      <Grid
        columnGap="1.25rem"
        rowGap="0.5rem"
        w="100%"
        gridTemplateAreas={{
          base: '"avatar edit" "name name" "desc desc"',
          md: '"avatar name edit" "avatar desc desc"',
        }}
        gridTemplateColumns={{
          base: 'max-content 1fr',
          md: 'max-content 1fr max-content',
        }}
      >
        <Avatar
          gridArea="avatar"
          name={data?.name}
          src={data?.image}
          size="2xl"
          w="7rem"
          h="7rem"
        />
        <Stack spacing={0} gridArea="name" alignSelf="flex-end">
          <Text wordBreak="break-all" textStyle="h6">
            {data?.name || data?.username}
          </Text>
          <Text wordBreak="break-all" textStyle="body-2">
            @{data?.username}
          </Text>
        </Stack>
        {isOwnProfile && (
          <Button
            gridArea="edit"
            width="max-content"
            alignSelf="center"
            justifySelf="flex-end"
            size="xs"
            as={Link}
            href={SETTINGS_PROFILE}
            variant="clear"
          >
            Edit Profile
          </Button>
        )}
        <Text textStyle="body-2" gridArea="desc" alignSelf="flex-start">
          {data?.bio}
        </Text>
      </Grid>
    </Flex>
  )
}
