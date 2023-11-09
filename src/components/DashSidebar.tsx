import {
  Box,
  CloseButton,
  IconButton,
  Flex,
  useBreakpoint,
} from '@chakra-ui/react'
import {
  SidebarContainer,
  SidebarItem,
  useIsMobile,
} from '@opengovsg/design-system-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { BiFace, BiHomeSmile, BiMenu } from 'react-icons/bi'
import { ADMIN_DASHBAR_WIDTHS, ADMIN_NAVBAR_HEIGHT } from '~/constants/layouts'
import { useMe } from '~/features/me/api'
import { HOME, PROFILE, SETTINGS_PROFILE } from '~/lib/routes'

export const DashSidebar = () => {
  const [showWhenSmallMobile, setShowWhenSmallMobile] = useState(false)
  const isMobile = useIsMobile()
  const { me } = useMe()
  const breakpointValue = useBreakpoint()
  const { pathname, query } = useRouter()

  const mobileButtonProps = {
    zIndex: 'overlay',
    colorScheme: 'neutral',
    border: '0px',
    borderRight: '1px',
    boxSize: ADMIN_NAVBAR_HEIGHT,
    borderRadius: '0px',
    borderColor: 'base.divider.medium',
    display: { base: 'inline-flex', sm: 'none' },
  }

  const isProfileActive = useMemo(() => {
    if (pathname === SETTINGS_PROFILE) return true
    if (
      pathname.startsWith(`${PROFILE}/[username]`) &&
      query.username === me?.username
    )
      return true
  }, [pathname, query.username, me?.username])

  const showText = isMobile && breakpointValue === 'sm'

  return (
    <Box
      position={{ base: 'fixed', sm: 'relative' }}
      zIndex={{ base: '20', sm: '1' }}
    >
      {showWhenSmallMobile ? (
        <CloseButton
          {...mobileButtonProps}
          aria-label="Close sidebar"
          onClick={() => setShowWhenSmallMobile(false)}
          bg="slate.100"
        />
      ) : (
        <IconButton
          {...mobileButtonProps}
          aria-label="Open sidebar"
          onClick={() => setShowWhenSmallMobile(true)}
          bg="white"
          variant="clear"
          icon={<BiMenu size="1.25rem" />}
        />
      )}
      <Flex
        bg="white"
        borderTop={showWhenSmallMobile ? '1px solid' : undefined}
        borderRight="1px solid"
        borderColor="base.divider.medium"
        pos="fixed"
        width={ADMIN_DASHBAR_WIDTHS}
        h={`calc(var(--chakra-vh) - ${ADMIN_NAVBAR_HEIGHT})`}
        opacity={{
          base: showWhenSmallMobile ? 1 : 0,
          sm: 1,
        }}
        flexDir="column"
        justify="space-between"
        zIndex="2"
        top={ADMIN_NAVBAR_HEIGHT}
        pt={0}
        pb="0.5rem"
        w={{ base: showWhenSmallMobile ? '100%' : 0, sm: 'fit-content' }}
        transition={{
          base: 'opacity 0.2s, width 0.2s',
          sm: undefined,
        }}
      >
        <SidebarContainer size="sm">
          <SidebarItem
            icon={BiHomeSmile}
            as={Link}
            href={HOME}
            isActive={pathname === HOME}
            title="Home"
            px={{ base: '1.125rem', sm: '0.75rem', md: '1rem' }}
            borderRadius={{ base: 0, md: 'md' }}
            onClick={() => setShowWhenSmallMobile(false)}
            display={{
              base: showWhenSmallMobile ? 'flex' : 'none',
              sm: 'flex',
            }}
          >
            {showText ? '' : 'Home'}
          </SidebarItem>
          <SidebarItem
            icon={BiFace}
            as={Link}
            href={`${PROFILE}/${me?.username}`}
            isActive={isProfileActive}
            title="Profile"
            px={{ base: '1.125rem', sm: '0.75rem', md: '1rem' }}
            borderRadius={{ base: 0, md: 'md' }}
            onClick={() => setShowWhenSmallMobile(false)}
            display={{
              base: showWhenSmallMobile ? 'flex' : 'none',
              sm: 'flex',
            }}
          >
            {showText ? '' : 'Profile'}
          </SidebarItem>
        </SidebarContainer>
      </Flex>
    </Box>
  )
}
