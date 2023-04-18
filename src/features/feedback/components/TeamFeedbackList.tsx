import { Box, Stack, StackDivider } from '@chakra-ui/react'
import { useFilterFeedback } from '../api/useFilterFeedback'
import { TeamFeedbackListSkeleton } from './TeamFeedbackListSkeleton'
import { TeamFeedbackRow } from './TeamFeedbackRow'

export const TeamFeedbackList = (): JSX.Element => {
  const { filteredFeedback, isFetching } = useFilterFeedback()

  if (!filteredFeedback) {
    return <TeamFeedbackListSkeleton />
  }

  return (
    <Stack divider={<StackDivider />} spacing={0}>
      {filteredFeedback?.items.map((feedback) => (
        <Box key={feedback.id} opacity={isFetching ? 0.7 : 1}>
          <TeamFeedbackRow feedback={feedback} />
        </Box>
      ))}
    </Stack>
  )
}
