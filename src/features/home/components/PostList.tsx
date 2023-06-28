import { Post } from '~/features/posts/components'
import { trpc } from '~/utils/trpc'
import { EmptyPostList } from './EmptyPostList'

export const PostList = (): JSX.Element => {
  const [data] = trpc.post.list.useSuspenseQuery({})

  if (data.items.length === 0) {
    return <EmptyPostList />
  }
  return (
    <>
      {data.items.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  )
}
