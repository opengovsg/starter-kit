import { Box, Flex } from '@chakra-ui/react'
import { SidebarContainer, SidebarItem } from '@opengovsg/design-system-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { BiFace, BiHomeSmile, BiLogOutCircle } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { HOME, PROFILE, SETTINGS_PROFILE } from '~/lib/routes'

export const DashSidebar = () => {
  const { me, logout } = useMe()
  const { pathname, query } = useRouter()

  const isProfileActive = useMemo(() => {
    if (pathname === SETTINGS_PROFILE) return true
    if (
      pathname.startsWith(`${PROFILE}/[username]`) &&
      query.username === me?.username
    )
      return true
  }, [pathname, query.username, me?.username])

  return (
    <Box
      gridColumn={{ md: '1/3' }}
      w={{ md: '13.5rem' }}
      bg="white"
      position="relative"
      borderRight="1px solid"
      borderColor="base.divider.medium"
    >
      <Flex
        pos="fixed"
        w={{ md: '13.5rem' }}
        h="calc(var(--chakra-vh) - var(--chakra-sizes-appNavbar))"
        flexDir="column"
        justify="space-between"
        pb="0.5rem"
      >
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
        <SidebarContainer>
          <SidebarItem
            icon={BiLogOutCircle}
            as="button"
            onClick={() => logout(true)}
          >
            Log out
          </SidebarItem>
        </SidebarContainer>
      </Flex>
    </Box>
  )
}
