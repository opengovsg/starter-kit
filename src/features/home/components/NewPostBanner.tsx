import { Stack, Text } from '@chakra-ui/react'
import { NewPostModalButton } from '~/features/posts/components'

export const NewPostBanner = (): JSX.Element => {
  return (
    <Stack justify="space-between" direction="row" align="center">
      <Text as="h2" textStyle="h6">
        What’s on your mind?
      </Text>
      <NewPostModalButton />
    </Stack>
  )
}
