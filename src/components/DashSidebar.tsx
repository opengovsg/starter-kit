import { Box, Flex } from '@chakra-ui/react'
import {
  SidebarContainer,
  SidebarItem,
  useIsMobile,
} from '@opengovsg/design-system-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { BiFace, BiHomeSmile } from 'react-icons/bi'
import { ADMIN_DASHBAR_WIDTHS, ADMIN_NAVBAR_HEIGHT } from '~/constants/layouts'
import { useMe } from '~/features/me/api'
import { HOME, PROFILE, SETTINGS_PROFILE } from '~/lib/routes'

export const DashSidebar = () => {
  const isMobile = useIsMobile()
  const { me } = useMe()
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
    <Box position="relative">
      <Flex
        bg="white"
        borderRight="1px solid"
        borderColor="base.divider.medium"
        pos="fixed"
        width={ADMIN_DASHBAR_WIDTHS}
        h={`calc(var(--chakra-vh) - ${ADMIN_NAVBAR_HEIGHT})`}
        flexDir="column"
        justify="space-between"
        zIndex="2"
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
      </Flex>
    </Box>
  )
}
