import { Divider, Stack } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { APP_GRID_COLUMN } from '~/constants/layouts'
import { SkeletonThreadPostList } from './SkeletonThreadPostList'
import { SkeletonThreadPost } from './SkeletonThreadPost'

export const SkeletonThreadView = (): JSX.Element | null => {
  return (
    <Stack spacing={0} gridColumn={APP_GRID_COLUMN} flexDir="column" py="1rem">
      <SkeletonThreadPost />
      <Button
        isDisabled
        size="sm"
        isFullWidth
        my="1rem"
        aria-label="Reply to post"
      >
        Reply to post
      </Button>
      <Divider />
      <SkeletonThreadPostList />
    </Stack>
  )
}
