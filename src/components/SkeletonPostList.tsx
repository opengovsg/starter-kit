import { Stack, StackDivider } from '@chakra-ui/react'
import { useMemo } from 'react'
import { PostSkeleton } from '~/features/posts/components'

interface SkeletonPostListProps {
  /**
   * Number of skeleton posts to render
   * @default 3
   */
  count?: number
}

export const SkeletonPostList = ({
  count = 10,
}: SkeletonPostListProps): JSX.Element => {
  const skeletonPosts = useMemo(() => {
    return Array.from({ length: count }, (_, index) => (
      <PostSkeleton key={index} />
    ))
  }, [count])

  return (
    <Stack spacing={0} divider={<StackDivider />} py="1rem">
      {skeletonPosts}
    </Stack>
  )
}
