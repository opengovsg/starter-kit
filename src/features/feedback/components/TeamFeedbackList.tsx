import { Box, Stack, StackDivider } from '@chakra-ui/react'
import { useFilterFeedback } from '../api/useFilterFeedback'
import { TeamFeedbackRow } from './TeamFeedbackRow'

export const TeamFeedbackList = (): JSX.Element => {
  const { filteredFeedback } = useFilterFeedback()

  return (
    <Stack divider={<StackDivider />} spacing={0}>
      {filteredFeedback?.items.map((feedback) => (
        <Box key={feedback.id}>
          <TeamFeedbackRow feedback={feedback} />
        </Box>
      ))}
    </Stack>
  )
}
