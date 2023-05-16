import { Box } from '@chakra-ui/react'
import { SidebarContainer, SidebarItem } from '@opengovsg/design-system-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { BiFace, BiHomeSmile } from 'react-icons/bi'
import { HOME, PROFILE } from '~/lib/routes'

export const DashSidebar = () => {
  const { pathname } = useRouter()

  return (
    <Box minW="13.5rem">
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
          href={PROFILE}
          isActive={pathname === PROFILE}
        >
          Profile
        </SidebarItem>
      </SidebarContainer>
    </Box>
  )
}
