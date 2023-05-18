import { Avatar, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { RichText } from '~/components/RichText'
import { formatRelativeTime } from '~/lib/dates'
import { RouterOutput } from '~/utils/trpc'
import { PostActions } from '../PostActions'

export interface PostProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  hideActions?: boolean
}

export const Post = ({ post, hideActions }: PostProps): JSX.Element => {
  const relativeDate = useMemo(() => formatRelativeTime(post.createdAt), [post])

  return (
    <Stack direction="row" py="1.5rem" spacing="0.75rem">
      <Avatar src={post?.author.image ?? undefined} size="md" />
      <Stack direction="column" spacing="0.5rem" flex={1}>
        <Stack direction="row" spacing="1rem">
          <Text textStyle="subhead-2" color="base.content.strong">
            {post.author.name}
          </Text>
          <Text textStyle="body-2" color="base.content.medium">
            @{post.author.username}
          </Text>
          <Text
            title={post.createdAt.toLocaleString()}
            textStyle="body-2"
            color="base.content.medium"
          >
            {relativeDate}
          </Text>
        </Stack>
        <RichText defaultValue={post?.contentHtml} isReadOnly />
        {!hideActions && <PostActions post={post} />}
      </Stack>
    </Stack>
  )
}
