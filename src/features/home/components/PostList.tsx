import { Post } from '~/features/posts/components'
import { trpc } from '~/utils/trpc'
import { EmptyPostList } from './EmptyPostList'
import { Stack, StackDivider } from '@chakra-ui/react'
import { APP_GRID_COLUMN } from '~/constants/layouts'

export const PostList = (): JSX.Element => {
  const [data] = trpc.post.list.useSuspenseQuery({})

  if (data.items.length === 0) {
    return <EmptyPostList />
  }
  return (
    <Stack
      spacing={0}
      divider={<StackDivider />}
      gridColumn={APP_GRID_COLUMN}
      flexDir="column"
    >
      {data.items.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </Stack>
  )
}
