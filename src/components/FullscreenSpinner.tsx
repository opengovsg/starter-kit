import { Flex } from '@chakra-ui/react'
import { Spinner } from '@opengovsg/design-system-react'

export const FullscreenSpinner = (): JSX.Element => {
  return (
    <Flex w="100%" h="$100vh" align="center" justify="center">
      <Spinner />
    </Flex>
  )
}
