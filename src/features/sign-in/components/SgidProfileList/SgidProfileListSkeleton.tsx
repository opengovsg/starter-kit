import { Divider, Skeleton, Stack, Text } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { times } from 'lodash'
import { BiChevronRight } from 'react-icons/bi'

export const SgidProfileListSkeleton = (): JSX.Element => {
  return (
    <Stack divider={<Divider />}>
      {times(2).map((i) => (
        <Button
          key={i}
          isDisabled
          variant="reverse"
          h="auto"
          px="1rem"
          py="1.5rem"
          justifyContent="space-between"
          rightIcon={<BiChevronRight fontSize="1.5rem" />}
        >
          <Stack textAlign="start" color="base.content.medium">
            <Skeleton>
              <Text textStyle="subhead-2" color="base.content.strong">
                Loading...
              </Text>
            </Skeleton>
            <Skeleton>
              <Text textStyle="caption-2">
                Loading, but a very long line to render. There is also a second
                loading line.
              </Text>
            </Skeleton>
            <Skeleton>
              <Text textStyle="caption-2">Also loading...</Text>
            </Skeleton>
          </Stack>
        </Button>
      ))}
    </Stack>
  )
}
