import { Box, Flex, Grid, Stack, StackDivider, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { Avatar } from '~/components/Avatar'
import { useUser } from '~/features/profile/api'
import { RouterOutput } from '~/utils/trpc'
import { useFilterFeedback } from '../api/useFilterFeedback'
import { TeamFeedbackListSkeleton } from './TeamFeedbackListSkeleton'

type ListFeedbackOutputItem = RouterOutput['post']['list']['items'][number]
interface TeamFeedbackRowProps {
  loggedInId?: string
  feedback: ListFeedbackOutputItem
}

const TeamFeedbackRow = ({ feedback, loggedInId }: TeamFeedbackRowProps) => {
  const router = useRouter()

  const hasRead = useMemo(() => {
    if (!loggedInId) return false
    return feedback.readBy[loggedInId] ?? false
  }, [feedback.readBy, loggedInId])

  const handleOpenFeedback = useCallback(() => {
    router.query.feedbackId = String(feedback.id)
    router.push(router)
  }, [feedback.id, router])

  return (
    <Grid
      py="1.125rem"
      px="2rem"
      gridTemplateColumns="5fr 1fr 1fr 1fr"
      gap="0.25rem"
      pos="relative"
      cursor="pointer"
      onClick={handleOpenFeedback}
    >
      {!hasRead && (
        <Box pos="absolute" w="4px" h="100%" bg="blue.200" top={0} left={0} />
      )}
      <Box>
        <Flex gap="0.375rem" align="center">
          <Avatar src={feedback.author.image ?? undefined} size="2xs" />
          <Text textStyle="caption-2" color="base.content.medium">
            {feedback.author.name}
          </Text>
        </Flex>
        <Text color="base.content.default" textStyle="subhead-2" noOfLines={2}>
          {feedback.content}
        </Text>
      </Box>
      <Text
        textStyle="caption-2"
        color="base.content.medium"
        alignSelf="center"
      >
        {feedback.createdAt.toDateString()}
      </Text>
      <Text textStyle="caption-1" color="base.content.brand" alignSelf="center">
        {feedback._count.comments || 'No replies yet'}
      </Text>
    </Grid>
  )
}

export const TeamFeedbackList = (): JSX.Element => {
  const { user } = useUser()

  const { filteredFeedback, isFetching } = useFilterFeedback()

  if (!filteredFeedback) {
    return <TeamFeedbackListSkeleton />
  }

  return (
    <Stack divider={<StackDivider />} spacing={0}>
      {filteredFeedback?.items.map((feedback) => (
        <Box key={feedback.id} opacity={isFetching ? 0.7 : 1}>
          <TeamFeedbackRow loggedInId={user?.id} feedback={feedback} />
        </Box>
      ))}
    </Stack>
  )
}
