import { ButtonGroup } from '@chakra-ui/react'
import { Button, BxsHeart, IconButton } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { BiHeart, BiLink, BiSync } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { RouterOutput, trpc } from '~/utils/trpc'
import { AddCommentAction } from './AddCommentAction'
import { DeletePostAction } from './DeletePostAction'

export interface PostActionsProps {
  post: RouterOutput['post']['byUser']['posts'][number]
}

export const PostActions = ({ post }: PostActionsProps): JSX.Element => {
  const { me } = useMe()
  const { query } = useRouter()
  const isOwnPost = me?.username === post.author.username

  const utils = trpc.useContext()

  const toggleLikeMutation = trpc.post.toggleLikePost.useMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite(race condition) our optimistic update)
      await utils.post.byUser.cancel()
      const previousQueryData = utils.post.byUser.getData()
      utils.post.byUser.setData(
        { username: String(query.username) },
        (oldQueryData) => {
          if (oldQueryData) {
            // Update toggle state on old query data
            const dataIndex = oldQueryData.posts.findIndex(
              (item) => item.id === post.id
            )
            if (dataIndex >= 0) {
              const dataAtIndex = oldQueryData.posts[dataIndex]
              if (!dataAtIndex) {
                return
              }
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              oldQueryData.posts[dataIndex]!.likedByMe = !dataAtIndex.likedByMe
              // Update liked count
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              oldQueryData.posts[dataIndex]!._count.likes =
                dataAtIndex.likedByMe
                  ? dataAtIndex._count.likes + 1
                  : dataAtIndex._count.likes - 1
            }
            return oldQueryData
          }
        }
      )
      // return will pass the function or the value to the onError third argument:
      return () =>
        utils.post.byUser.setData(
          { username: String(query.username) },
          previousQueryData
        )
    },
    onError: (error, variables, rollback) => {
      //   If there is an errror, then we will rollback
      if (rollback) {
        rollback()
      }
    },
  })

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
      <AddCommentAction post={post} />
      <IconButton
        aria-label="Link to post"
        icon={<BiLink fontSize="1.25rem" />}
      />
      {isOwnPost && <DeletePostAction />}
    </ButtonGroup>
  )
}
