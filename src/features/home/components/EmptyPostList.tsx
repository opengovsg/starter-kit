import { Stack, Text } from '@chakra-ui/react'
import { BusStop } from '~/components/Svg'

export const EmptyPostList = (): JSX.Element => {
  return (
    <Stack spacing="2rem" align="center" pt="3rem">
      <Text textStyle="subhead-2">There aren&apos;t any posts yet</Text>
      <BusStop />
    </Stack>
  )
}
