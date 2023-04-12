import { Grid, Box, Flex, Avatar, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { useMemo } from 'react'
import { FEEDBACK } from '~/constants/routes'
import { RouterOutput } from '~/utils/trpc'

interface TeamFeedbackRowProps {
  loggedInId?: string
  feedback: RouterOutput['post']['list']['items'][number]
}

export const TeamFeedbackRow = ({
  feedback,
  loggedInId,
}: TeamFeedbackRowProps) => {
  const hasRead = useMemo(() => {
    if (!loggedInId) return false
    return feedback.readBy[loggedInId] ?? false
  }, [feedback.readBy, loggedInId])

  return (
    <Grid
      py="1.125rem"
      px="2rem"
      gridTemplateColumns="5fr 1fr 1fr 1fr"
      gap="0.25rem"
      pos="relative"
      cursor="pointer"
      as={Link}
      href={`${FEEDBACK}/${feedback.id}`}
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
