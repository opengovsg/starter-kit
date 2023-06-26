import { PostSkeleton } from '~/features/posts/components'

export const SkeletonPostList = (): JSX.Element => {
  return (
    <>
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </>
  )
}
