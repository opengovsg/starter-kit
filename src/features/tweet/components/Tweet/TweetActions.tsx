import { ButtonGroup } from '@chakra-ui/react'
import { Button, BxsHeart, IconButton } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { BiHeart, BiLink, BiMessageRounded, BiSync } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { RouterOutput, trpc } from '~/utils/trpc'
import { DeleteTweet } from './DeleteTweet'

export interface TweetActionsProps {
  tweet: RouterOutput['post']['byUser']['posts'][number]
}

export const TweetActions = ({ tweet }: TweetActionsProps): JSX.Element => {
  const { me } = useMe()
  const { query } = useRouter()
  const isOwnTweet = me?.username === tweet.author.username

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
              (item) => item.id === tweet.id
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
      postId: tweet.id,
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
        colorScheme={tweet.likedByMe ? 'main' : 'neutral'}
        aria-label="Like tweet"
        leftIcon={
          tweet.likedByMe ? (
            <BxsHeart fontSize="1.25rem" />
          ) : (
            <BiHeart fontSize="1.25rem" />
          )
        }
        onClick={handleLikeClick}
        isLoading={toggleLikeMutation.isLoading}
      >
        {tweet._count.likes}
      </Button>
      <Button aria-label="Retweet" leftIcon={<BiSync fontSize="1.25rem" />}>
        65
      </Button>
      <Button
        aria-label="Comment"
        leftIcon={<BiMessageRounded fontSize="1.25rem" />}
      >
        {tweet._count.replies}
      </Button>
      <IconButton
        aria-label="Link to tweet"
        icon={<BiLink fontSize="1.25rem" />}
      />
      {isOwnTweet && <DeleteTweet />}
    </ButtonGroup>
  )
}
