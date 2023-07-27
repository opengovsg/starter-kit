import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react'
import { type ThreadPostProps } from './ThreadPost'

type SkeletonThreadPostProps = Omit<ThreadPostProps, 'post'>

export const SkeletonThreadPost = ({
  containerProps,
}: SkeletonThreadPostProps): JSX.Element => {
  return (
    <Stack
      aria-hidden
      direction="row"
      py="1.5rem"
      mx={{ base: '-1rem' }}
      px={{ base: '1rem' }}
      spacing="0.75rem"
      {...containerProps}
    >
      <SkeletonCircle size="10" />
      <Stack direction="column" spacing="0.75rem" flex={1}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 0, md: '1rem' }}
        >
          <Skeleton w="fit-content">
            <Text textStyle="subhead-2" color="base.content.strong">
              loading...
            </Text>
          </Skeleton>
          <Stack direction="row" spacing="1rem">
            <Skeleton>
              <Text textStyle="body-2">@loading...</Text>
            </Skeleton>
            <Skeleton>
              <Text textStyle="body-2" color="base.content.medium">
                Ldg 18
              </Text>
            </Skeleton>
          </Stack>
        </Stack>
        <Stack ml={{ base: '-3.25rem', md: 0 }}>
          <SkeletonText noOfLines={2} />
          <Skeleton height="2.25rem" />
        </Stack>
      </Stack>
    </Stack>
  )
}
