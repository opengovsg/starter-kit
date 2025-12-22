'use client'

import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@opengovsg/oui'
import { BiChevronDown, BiLogOut } from 'react-icons/bi'

import { env } from '~/env'
import { useAuth } from '~/lib/auth'

export const AuthedNavbar = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Navbar>
      <NavbarContent justify="start">
        <NavbarBrand>
          <p className="font-bold text-inherit">{env.NEXT_PUBLIC_APP_NAME}</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <MenuTrigger>
            <Button
              variant="clear"
              size="md"
              endContent={<BiChevronDown className="h-5 w-5" />}
            >
              <Avatar
                size="xs"
                name={user.email}
                getInitials={(name) => name.slice(0, 2).toUpperCase()}
              >
                <Avatar.Fallback />
              </Avatar>
            </Button>
            <Menu>
              <MenuSection title={user.email}>
                <MenuItem startContent={<BiLogOut />} onPress={() => logout()}>
                  Logout
                </MenuItem>
              </MenuSection>
            </Menu>
          </MenuTrigger>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
