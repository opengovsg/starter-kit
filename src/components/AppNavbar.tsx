import { Flex, HStack } from '@chakra-ui/react'
import {
  AvatarMenu,
  AvatarMenuDivider,
  Link,
  Menu,
} from '@opengovsg/design-system-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { useMe } from '~/features/me/api'
import { SETTINGS_PROFILE } from '~/lib/routes'

export const AppNavbar = (): JSX.Element => {
  const { me, logout } = useMe({
    redirectTo: '/sign-in',
  })

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
        position="sticky"
        zIndex="sticky"
        top={0}
        py="0.75rem"
        bg="white"
        borderBottomWidth="1px"
        borderColor="base.divider.medium"
      >
        <Link as={NextLink} href="/">
          <Image
            src="/assets/ogp-logo.svg"
            width={32}
            height={32}
            alt="OGP Logo"
            priority
          />
        </Link>
        <HStack
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
      </Flex>
    </>
  )
}
