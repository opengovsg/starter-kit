import { Avatar, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { RichText } from '~/components/RichText'
import { formatRelativeTime } from '~/lib/dates'
import { RouterOutput } from '~/utils/trpc'

export interface TweetProps {
  tweet: RouterOutput['post']['byUser']['posts'][number]
}

export const Tweet = ({ tweet }: TweetProps): JSX.Element => {
  const relativeDate = useMemo(
    () => formatRelativeTime(tweet.createdAt),
    [tweet]
  )

  return (
    <Stack direction="row" py="1rem" spacing="0.75rem">
      <Avatar src={tweet?.author.image ?? undefined} size="md" />
      <Stack direction="column" spacing="0.5rem" flex={1}>
        <Stack direction="row" spacing="1rem">
          <Text textStyle="subhead-2" color="base.content.strong">
            {tweet.author.name}
          </Text>
          <Text textStyle="body-2" color="base.content.medium">
            @{tweet.author.username}
          </Text>
          <Text
            title={tweet.createdAt.toLocaleString()}
            textStyle="body-2"
            color="base.content.medium"
          >
            {relativeDate}
          </Text>
        </Stack>
        <RichText defaultValue={tweet?.contentHtml} isReadOnly />
      </Stack>
    </Stack>
  )
}
