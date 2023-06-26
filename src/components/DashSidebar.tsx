import { Box, Flex } from '@chakra-ui/react'
import {
  SidebarContainer,
  SidebarItem,
  useIsMobile,
} from '@opengovsg/design-system-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { BiFace, BiHomeSmile, BiLogOutCircle } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { HOME, PROFILE, SETTINGS_PROFILE } from '~/lib/routes'

export const DashSidebar = () => {
  const isMobile = useIsMobile()
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
      w={{ base: '2.75rem', md: '10.5rem', lg: '13.5rem' }}
      bg="white"
      position="relative"
      borderRight="1px solid"
      borderColor="base.divider.medium"
    >
      <Flex
        pos="fixed"
        w={{ base: '2.75rem', md: '10.5rem', lg: '13.5rem' }}
        h="calc(var(--chakra-vh) - var(--chakra-sizes-appNavbar))"
        flexDir="column"
        justify="space-between"
        pb="0.5rem"
      >
        <SidebarContainer size="sm">
          <SidebarItem
            icon={BiHomeSmile}
            as={Link}
            href={HOME}
            isActive={pathname === HOME}
            title="Home"
            px={{ base: '0.75rem', md: '1rem' }}
            borderRadius={{ base: 0, md: 'md' }}
          >
            {isMobile ? '' : 'Home'}
          </SidebarItem>
          <SidebarItem
            icon={BiFace}
            as={Link}
            href={`${PROFILE}/${me?.username}`}
            isActive={isProfileActive}
            title="Profile"
            px={{ base: '0.75rem', md: '1rem' }}
            borderRadius={{ base: 0, md: 'md' }}
          >
            {isMobile ? '' : 'Profile'}
          </SidebarItem>
        </SidebarContainer>
        <SidebarContainer size="sm">
          <SidebarItem
            icon={BiLogOutCircle}
            as="button"
            onClick={() => logout(true)}
            title="Log out"
            px={{ base: '0.75rem', md: '1rem' }}
            borderRadius={{ base: 0, md: 'md' }}
            mb="1rem"
          >
            {isMobile ? '' : 'Log out'}
          </SidebarItem>
        </SidebarContainer>
      </Flex>
    </Box>
  )
}
