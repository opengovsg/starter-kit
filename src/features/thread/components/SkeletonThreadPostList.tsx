import { Stack, StackDivider } from '@chakra-ui/react'
import { useMemo } from 'react'
import { APP_GRID_COLUMN } from '~/constants/layouts'
import { SkeletonThreadPost } from './SkeletonThreadPost'

interface SkeletonThreadPostListProps {
  /**
   * Number of skeleton replies to render
   * @default 3
   */
  count?: number
}

export const SkeletonThreadPostList = ({
  count = 3,
}: SkeletonThreadPostListProps): JSX.Element => {
  const skeletonThreadPosts = useMemo(() => {
    return Array.from({ length: count }, (_, index) => (
      <SkeletonThreadPost key={index} />
    ))
  }, [count])

  return (
    <Stack
      spacing={0}
      divider={<StackDivider />}
      gridColumn={APP_GRID_COLUMN}
      flexDir="column"
    >
      {skeletonThreadPosts}
    </Stack>
  )
}
