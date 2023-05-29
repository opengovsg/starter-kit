import { Breadcrumb, Flex } from '@chakra-ui/react'

import { Crumb, type CrumbProps } from '~/components/Breadcrumb'

const DEFAULT_FEEDBACK_CRUMBS: CrumbProps[] = [
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

interface FeedbackNavbarProps {
  crumbs?: CrumbProps[]
}

export const FeedbackNavbar = ({
  crumbs = DEFAULT_FEEDBACK_CRUMBS,
}: FeedbackNavbarProps): JSX.Element => {
  return (
    <Flex
      justify="space-between"
      align="center"
      px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
      py="0.875rem"
      bg="white"
      borderBottomWidth="1px"
      borderColor="base.divider.medium"
    >
      <Breadcrumb textStyle="body-2">
        {crumbs.map((crumb, index) => (
          <Crumb key={index} {...crumb} />
        ))}
      </Breadcrumb>
    </Flex>
  )
}
