import { Box } from '@chakra-ui/react'
import { SidebarContainer, SidebarItem } from '@opengovsg/design-system-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { BiFace, BiHomeSmile } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { HOME, PROFILE, SETTINGS_PROFILE } from '~/lib/routes'

export const DashSidebar = () => {
  const { me } = useMe()
  const { pathname, query } = useRouter()

  const isProfileActive = useMemo(() => {
    if (pathname === SETTINGS_PROFILE) return true
    if (pathname === `${PROFILE}/[username]` && query.username === me?.username)
      return true
  }, [pathname, query.username, me?.username])

  return (
    <Box gridColumn={{ md: '1/3' }} bg="white">
      <SidebarContainer>
        <SidebarItem
          icon={BiHomeSmile}
          as={Link}
          href={HOME}
          isActive={pathname === HOME}
        >
          Home
        </SidebarItem>
        <SidebarItem
          icon={BiFace}
          as={Link}
          href={`${PROFILE}/${me?.username}`}
          isActive={isProfileActive}
        >
          Profile
        </SidebarItem>
      </SidebarContainer>
    </Box>
  )
}
