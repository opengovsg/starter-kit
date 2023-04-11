import { Flex } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { BiMessageSquareEdit, BiCog } from 'react-icons/bi'
import { HOME } from '~/lib/routes'
import { Sidebar } from './Sidebar'

export const DashSidebar = () => {
  const { pathname } = useRouter()

  return (
    <Flex minW="13.5rem">
      <Sidebar
        items={[
          {
            label: 'Feedback',
            icon: <BiMessageSquareEdit fontSize="1.5rem" />,
            props: {
              isActive: pathname === HOME,
              as: Link,
              href: HOME,
            },
          },
        ]}
      />
    </Flex>
  )
}
