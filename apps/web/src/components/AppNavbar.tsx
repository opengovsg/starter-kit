import Image from 'next/image'
import NextLink from 'next/link'
import { Flex, HStack } from '@chakra-ui/react'
import { AvatarMenu, Link, Menu } from '@opengovsg/design-system-react'

import { APP_PX } from '~/constants/layouts'
import { useMe } from '~/features/me/api/useMe'

export const AppNavbar = (): JSX.Element => {
  const { me, logout } = useMe()

  return (
    <Flex flex="0 0 auto" gridColumn="1/-1">
      <Flex
        w="100%"
        justify="space-between"
        align="center"
        px={APP_PX}
        py="0.375rem"
        bg="white"
        borderBottomWidth="1px"
        borderColor="base.divider.medium"
        transition="padding 0.1s"
      >
        <Link
          as={NextLink}
          href="/home"
          mx={{ base: 'auto', sm: 0 }}
          transition="margin 0.1s"
        >
          <Image
            // This component can only be used if this is an application created by OGP.
            src="/assets/restricted-ogp-logo-full.svg"
            width={233}
            height={12}
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
            <Menu.Item onClick={() => logout()}>Sign out</Menu.Item>
          </AvatarMenu>
        </HStack>
      </Flex>
    </Flex>
  )
}
