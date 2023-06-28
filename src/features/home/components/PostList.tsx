import { Stack, Text } from '@chakra-ui/react'
import { BusStop } from '~/components/Svg/BusStop'
import { Post } from '~/features/posts/components'
import { type RouterOutput } from '~/utils/trpc'

export interface PostsProps {
  posts: RouterOutput['post']['byUser']['posts'][number][]
}

export const PostList = ({ posts }: PostsProps): JSX.Element => {
  if (posts.length === 0) {
    return (
      <Stack spacing="2rem" align="center" pt="3rem">
        <Text textStyle="subhead-2">No posts yet</Text>
        <BusStop />
      </Stack>
    )
  }
  return (
    <>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  )
}
