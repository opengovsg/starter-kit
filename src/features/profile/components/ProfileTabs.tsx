import { Stack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { NavigationTab, NavigationTabList } from '~/components/NavigationalTabs'
import { useMe } from '~/features/me/api'
import { NewPostModalButton } from '~/features/posts/components'

export interface ProfileTabsProps {
  username: string
}

export const ProfileTabs = ({ username }: ProfileTabsProps): JSX.Element => {
  const { pathname } = useRouter()
  const { me } = useMe()

  const isLoggedInProfile = me?.username === username

  return (
    <Stack
      pt="1.5rem"
      pb="1rem"
      align="center"
      justify="space-between"
      direction="row"
      gap="1rem"
    >
      <NavigationTabList
        m="auto"
        w="100%"
        borderBottom="none"
        justifySelf="flex-start"
      >
        <NavigationTab
          href={`/profile/${username}`}
          isActive={pathname === '/profile/[username]'}
        >
          Posts
        </NavigationTab>
        <NavigationTab
          href={`/profile/${username}/liked`}
          isActive={pathname === '/profile/[username]/liked'}
        >
          Liked
        </NavigationTab>
        <NavigationTab
          href={`/profile/${username}/replies`}
          isActive={pathname === '/profile/[username]/replies'}
        >
          Replies
        </NavigationTab>
      </NavigationTabList>
      {isLoggedInProfile && <NewPostModalButton />}
    </Stack>
  )
}
