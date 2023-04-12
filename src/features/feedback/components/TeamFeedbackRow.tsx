import { Grid, Box, Flex, Avatar, Text } from '@chakra-ui/react'
import { IconButton } from '@opengovsg/design-system-react'
import Link from 'next/link'
import { BiTrash } from 'react-icons/bi'
import { FEEDBACK } from '~/constants/routes'
import { RouterOutput } from '~/utils/trpc'

interface TeamFeedbackRowProps {
  feedback: RouterOutput['post']['list']['items'][number]
}

export const TeamFeedbackRow = ({ feedback }: TeamFeedbackRowProps) => {
  return (
    <Grid
      py="1.125rem"
      px="2rem"
      gridTemplateColumns="5fr 1fr 1fr 3rem"
      gap="0.25rem"
      pos="relative"
    >
      {!feedback.read && (
        <Box pos="absolute" w="4px" h="100%" bg="blue.200" top={0} left={0} />
      )}
      <Box cursor="pointer" as={Link} href={`${FEEDBACK}/${feedback.id}`}>
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
      <IconButton
        w={0}
        variant="clear"
        colorScheme="critical"
        aria-label="Delete feedback"
        icon={<BiTrash />}
      />
    </Grid>
  )
}
