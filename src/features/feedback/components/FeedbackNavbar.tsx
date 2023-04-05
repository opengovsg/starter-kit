import { Breadcrumb, Flex, HStack } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'

import { Crumb, CrumbProps } from '~/components/Breadcrumb'

const FEEDBACK_CRUMBS: CrumbProps[] = [
  {
    label: 'All feedback',
    href: '/dashboard',
  },
  {
    label: 'New feedback',
    last: true,
    href: '/feedback/new',
  },
]

export const FeedbackNavbar = (): JSX.Element => {
  return (
    <Flex
      justify="space-between"
      align="center"
      px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
      py="0.75rem"
      bg="white"
      borderBottomWidth="1px"
    >
      <Breadcrumb textStyle="body-2">
        {FEEDBACK_CRUMBS.map((crumb, index) => (
          <Crumb key={index} {...crumb} />
        ))}
      </Breadcrumb>
      <HStack textStyle="subhead-1" spacing={{ base: '0.75rem', md: '1.5rem' }}>
        <Button variant="outline">Save as draft</Button>
      </HStack>
    </Flex>
  )
}
