import { Box, Container, Text } from '@chakra-ui/react'
import { Post } from '~/features/posts/components'
import { type RouterOutput } from '~/utils/trpc'

export interface PostsProps {
  posts: RouterOutput['post']['byUser']['posts'][number][]
}

export const PostList = ({ posts }: PostsProps): JSX.Element => {
  if (posts.length === 0) {
    return (
      <Box mt="10%">
        <Text textStyle="h6">No posts yet</Text>
      </Box>
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
