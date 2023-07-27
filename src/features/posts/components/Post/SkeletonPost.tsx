import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react'
import { type PostViewProps } from './PostView'

type SkeletonPostProps = Omit<PostViewProps, 'post'>

export const SkeletonPost = ({
  containerProps,
  hideActions,
}: SkeletonPostProps): JSX.Element => {
  return (
    <Stack
      flexDir="column"
      spacing="1rem"
      px={{ base: '1rem', lg: '1.5rem' }}
      mx={{ base: '-1rem', lg: '-1.5rem' }}
      {...containerProps}
    >
      <Stack spacing="1rem" direction="row">
        <SkeletonCircle size="10" />
        <Stack spacing="0.25rem">
          <Skeleton h="1rem">
            <Text textStyle="subhead-2" color="base.content.strong">
              Loading...
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
      </Stack>
      <Stack ml={{ base: '-3.25rem', md: 0 }}>
        <SkeletonText
          spacing="0.25rem"
          skeletonHeight="1.125rem"
          noOfLines={2}
        />
        {!hideActions && <Skeleton height="2.25rem" />}
      </Stack>
    </Stack>
  )
}
