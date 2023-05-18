import { Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NewPostBannerProps {}

export const NewPostBanner = ({}: NewPostBannerProps): JSX.Element => {
  return (
    <Stack justify="space-between" direction="row" align="center">
      <Text as="h2" textStyle="h6">
        What’s on your mind?
      </Text>
      <Button size="xs">New post</Button>
    </Stack>
  )
}
