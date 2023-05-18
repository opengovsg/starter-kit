import { ButtonGroup } from '@chakra-ui/react'
import { Button, IconButton } from '@opengovsg/design-system-react'
import { BiHeart, BiLink, BiMessageRounded, BiSync } from 'react-icons/bi'
import { useMe } from '~/features/me/api'
import { RouterOutput } from '~/utils/trpc'
import { DeleteTweet } from './DeleteTweet'

export interface TweetActionsProps {
  tweet: RouterOutput['post']['byUser']['posts'][number]
}

export const TweetActions = ({ tweet }: TweetActionsProps): JSX.Element => {
  const { me } = useMe()
  const isOwnTweet = me?.username === tweet.author.username

  return (
    <ButtonGroup
      variant="clear"
      size="xs"
      colorScheme="neutral"
      justifyContent="space-between"
    >
      <Button aria-label="Like tweet" leftIcon={<BiHeart fontSize="1.25rem" />}>
        65
      </Button>
      <Button aria-label="Retweet" leftIcon={<BiSync fontSize="1.25rem" />}>
        65
      </Button>
      <Button
        aria-label="Comment"
        leftIcon={<BiMessageRounded fontSize="1.25rem" />}
      >
        65
      </Button>
      <IconButton
        aria-label="Link to tweet"
        icon={<BiLink fontSize="1.25rem" />}
      />
      {isOwnTweet && <DeleteTweet />}
    </ButtonGroup>
  )
}
