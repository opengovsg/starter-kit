import { Box, ButtonGroup } from '@chakra-ui/react'
import { Button, BxsHeart } from '@opengovsg/design-system-react'
import { useState, type MouseEventHandler } from 'react'
import { BiHeart } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { trpc, type RouterOutput } from '~/utils/trpc'
import { AddCommentAction } from './AddCommentAction'
import { CopyAction } from './CopyAction'
import { DeletePostAction } from './DeletePostAction'

export interface PostActionsProps {
  post: RouterOutput['post']['byUser']['posts'][number]
}

export const PostActions = ({
  post: postProp,
}: PostActionsProps): JSX.Element => {
  const { me } = useMe()

  // Use local state to update the UI immediately on like/unlike
  const [post, setPost] = useState(postProp)
  const isOwnPost = me?.username === post.author.username

  const toggleLikeMutation = trpc.post.toggleLikePost.useMutation({
    onMutate: async () => {
      const previousPost = post
      const nextPost = post
      nextPost.likedByMe = !post.likedByMe
      nextPost._count.likes = post.likedByMe
        ? post._count.likes + 1
        : post._count.likes - 1
      setPost(nextPost)
      // return will pass the function or the value to the onError third argument:
      return previousPost
    },
    onError: (_error, _variables, previousPost) => {
      //   If there is an errror, then we will rollback
      if (previousPost) {
        setPost(previousPost)
      }
    },
  })

  const incrementReplyCount = () => {
    setPost((prevPost) => ({
      ...prevPost,
      _count: {
        ...prevPost._count,
        replies: prevPost._count.replies + 1,
      },
    }))
  }

  const handleLikeClick: MouseEventHandler = (e) => {
    e.stopPropagation()
    if (!me) return
    return toggleLikeMutation.mutate({
      postId: post.id,
    })
  }

  return (
    <ButtonGroup
      variant="clear"
      size="xs"
      colorScheme="neutral"
      justifyContent="space-between"
    >
      <Button
        data-value="post-action"
        px="0.25rem"
        colorScheme={post.likedByMe ? 'main' : 'neutral'}
        aria-label="Like post"
        leftIcon={
          post.likedByMe ? (
            <BxsHeart fontSize="1.25rem" />
          ) : (
            <BiHeart fontSize="1.25rem" />
          )
        }
        onClick={handleLikeClick}
        isLoading={toggleLikeMutation.isLoading}
      >
        {post._count.likes}
      </Button>
      <AddCommentAction post={post} onSuccess={incrementReplyCount} />
      <CopyAction postId={post.id} />
      {isOwnPost ? (
        <DeletePostAction postId={post.id} />
      ) : (
        <Box width="2.25rem" />
      )}
    </ButtonGroup>
  )
}
