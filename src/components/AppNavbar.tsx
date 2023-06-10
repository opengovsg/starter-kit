import { Flex, HStack } from '@chakra-ui/react'
import {
  AvatarMenu,
  AvatarMenuDivider,
  Link,
  Menu,
} from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { useUser } from '~/features/profile/api'

export const AppNavbar = (): JSX.Element => {
  const { user, logout } = useUser()
  const { pathname } = useRouter()

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
        py="0.75rem"
        bg="white"
        borderBottomWidth="1px"
        borderColor="base.divider.medium"
      >
        <Link as={NextLink} href="/">
          Starter Kit
          {/* <Image
            // This component can only be used if this is an application created by OGP.
            src="/assets/restricted-ogp-logo-full.svg"
            width={233}
            height={12}
            alt="OGP Logo"
            priority
          /> */}
        </Link>
        <HStack
          textStyle="subhead-1"
          spacing={{ base: '0.75rem', md: '1.5rem' }}
        >
          <AvatarMenu
            // @ts-expect-error missing type in design-system
            src={user?.image ?? undefined}
            name={user?.name ?? undefined}
            variant="subtle"
            bg="base.canvas.brand-subtle"
            menuListProps={{ maxWidth: '19rem' }}
          >
            <Menu.Item
              disabled={pathname === '/profile'}
              as={NextLink}
              href="/profile"
            >
              Edit profile
            </Menu.Item>
            <AvatarMenuDivider />
            <Menu.Item onClick={() => logout()}>Sign out</Menu.Item>
          </AvatarMenu>
        </HStack>
      </Flex>
    </>
  )
}
