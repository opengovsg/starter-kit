import { Box, HStack } from '@chakra-ui/react'
import {
  AvatarMenu,
  AvatarMenuDivider,
  Link,
  Menu,
  Searchbar,
} from '@opengovsg/design-system-react'
import Image from 'next/image'
import NextLink from 'next/link'

import ogpLogo from '~/assets/ogp-logo.svg'
import { useMe } from '~/features/me/api'
import { SETTINGS_PROFILE } from '~/lib/routes'
import { AppGrid } from '~/templates/AppGrid'

export const AppNavbar = (): JSX.Element => {
  const { me, logout } = useMe({
    redirectTo: '/sign-in',
  })

  return (
    <AppGrid
      alignItems="center"
      py="0.75rem"
      bg="white"
      borderBottomWidth="1px"
      borderColor="base.divider.medium"
    >
      <Link as={NextLink} href="/" px="1.5rem">
        <Image src={ogpLogo} alt="OGP Logo" priority />
      </Link>
      <Box gridColumn={{ md: '4 / 10', lg: '5 / 9' }}>
        <Searchbar isExpanded />
      </Box>
      <HStack
        gridColumnStart={{ base: 4, md: 12 }}
        textStyle="subhead-1"
        spacing={{ base: '0.75rem', md: '1.5rem' }}
      >
        <AvatarMenu
          src={me?.image ?? undefined}
          name={me?.name ?? undefined}
          variant="subtle"
          bg="base.canvas.brand-subtle"
          menuListProps={{ maxWidth: '19rem' }}
        >
          <Menu.Item as={NextLink} href={SETTINGS_PROFILE}>
            Edit profile
          </Menu.Item>
          <AvatarMenuDivider />
          <Menu.Item onClick={() => logout()}>Sign out</Menu.Item>
        </AvatarMenu>
      </HStack>
    </AppGrid>
  )
}
