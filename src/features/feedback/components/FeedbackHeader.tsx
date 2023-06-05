import { Stack, Text, Icon } from '@chakra-ui/react'
import { BiPlus } from 'react-icons/bi'
import { trpc } from '~/utils/trpc'
import { Button } from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { FeedbackUncleSvgr } from './FeedbackUncleSvgr'

export const FeedbackHeader = () => {
  const [counts] = trpc.post.unreadCount.useSuspenseQuery()

  return (
    <Stack justify="space-between" flexDir="row">
      <Stack flexDir="row" align="center">
        <FeedbackUncleSvgr h="72px" aria-hidden transform="scale(-1,1)" />
        <Text textStyle="subhead-1" color="base.content.medium">
          <Text as="span" textStyle="h4" color="base.content.default">
            {counts?.unreadCount ?? 0}
          </Text>{' '}
          unread feedback of {counts?.totalCount ?? 0}
        </Text>
      </Stack>
      <Button
        as={NextLink}
        href="/feedback/new"
        leftIcon={<Icon fontSize="1.25rem" as={BiPlus} />}
      >
        Write feedback
      </Button>
    </Stack>
  )
}
