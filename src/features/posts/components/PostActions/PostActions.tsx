import { ButtonGroup } from '@chakra-ui/react'
import { Button, BxsHeart, IconButton } from '@opengovsg/design-system-react'
import { useState } from 'react'
import { BiHeart, BiLink, BiSync } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { RouterOutput, trpc } from '~/utils/trpc'
import { AddCommentAction } from './AddCommentAction'
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
    onError: (error, variables, previousPost) => {
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

  const handleLikeClick = () => {
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
      <Button aria-label="Repost" leftIcon={<BiSync fontSize="1.25rem" />}>
        65
      </Button>
      <AddCommentAction post={post} onSuccess={incrementReplyCount} />
      <IconButton
        aria-label="Link to post"
        icon={<BiLink fontSize="1.25rem" />}
      />
      {isOwnPost && <DeletePostAction />}
    </ButtonGroup>
  )
}
