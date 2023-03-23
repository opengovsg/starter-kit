import { Flex, HStack, useDisclosure } from '@chakra-ui/react';
import {
  AvatarMenu,
  AvatarMenuDivider,
  Link,
  Menu,
} from '@opengovsg/design-system-react';
import Image from 'next/image';
import NextLink from 'next/link';

import ogpLogo from '~/assets/ogp-logo.svg';
import { EditProfileModal } from '~/features/profile';
import { useUser } from '~/features/profile/api';

export const AppNavbar = (): JSX.Element => {
  const { user, logout } = useUser();
  const { onOpen, isOpen, onClose } = useDisclosure();

  return (
    <>
      <EditProfileModal isOpen={isOpen} onClose={onClose} />
      <Flex
        justify="space-between"
        align="center"
        px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
        py="0.75rem"
        bg="white"
        borderBottomWidth="1px"
      >
        <Link as={NextLink} title="Form Logo" href="/">
          <Image src={ogpLogo} alt="OGP Logo" priority />
        </Link>
        <HStack
          textStyle="subhead-1"
          spacing={{ base: '0.75rem', md: '1.5rem' }}
        >
          <AvatarMenu
            // @ts-expect-error missing type in design-system
            src={user?.image ?? undefined}
            name={user?.email ?? undefined}
            menuListProps={{ maxWidth: '19rem' }}
          >
            <Menu.Item onClick={onOpen}>Edit profile</Menu.Item>
            <AvatarMenuDivider />
            <Menu.Item onClick={() => logout()}>Sign out</Menu.Item>
          </AvatarMenu>
        </HStack>
      </Flex>
    </>
  );
};
