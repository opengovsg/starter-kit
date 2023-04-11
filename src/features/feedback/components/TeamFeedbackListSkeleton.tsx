import {
  Box,
  Flex,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  StackDivider,
} from '@chakra-ui/react'

const TeamFeedbackRowSkeleton = () => {
  return (
    <Box py="1.125rem" px="2rem">
      <Flex gap="0.375rem" align="center">
        <SkeletonCircle size="1.25rem" />
        <Skeleton w="6.25rem" h="1rem" />
      </Flex>
      <SkeletonText
        mt="0.25rem"
        noOfLines={2}
        spacing="2px"
        skeletonHeight="1.25rem"
      />
    </Box>
  )
}

export const TeamFeedbackListSkeleton = (): JSX.Element => {
  return (
    <Stack divider={<StackDivider color="base.divider.medium" />}>
      <TeamFeedbackRowSkeleton />
      <TeamFeedbackRowSkeleton />
      <TeamFeedbackRowSkeleton />
      <TeamFeedbackRowSkeleton />
      <TeamFeedbackRowSkeleton />
    </Stack>
  )
}
