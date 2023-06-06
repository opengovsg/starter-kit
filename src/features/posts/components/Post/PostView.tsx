import { Avatar, Stack, type StackProps, Text } from '@chakra-ui/react'
import { Link } from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { useMemo } from 'react'
import { RichText } from '~/components/RichText'
import { formatRelativeTime } from '~/lib/dates'
import { PROFILE } from '~/lib/routes'
import { type RouterOutput } from '~/utils/trpc'
import { PostActions } from '../PostActions'
import { PostImages } from './PostImages'

export interface PostViewProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  hideActions?: boolean
  containerProps?: StackProps
}

export const PostView = ({
  post,
  hideActions,
  containerProps,
}: PostViewProps): JSX.Element => {
  const relativeDate = useMemo(() => formatRelativeTime(post.createdAt), [post])
  return (
    <Stack direction="row" p="1.5rem" spacing="0.75rem" {...containerProps}>
      <Avatar src={post?.author.image ?? undefined} size="md" />
      <Stack direction="column" spacing="0.5rem" flex={1}>
        <Stack direction="row" spacing="1rem">
          <Text textStyle="subhead-2" color="base.content.strong">
            {post.author.name}
          </Text>
          <Link
            data-value="post-action"
            variant="standalone"
            p={0}
            as={NextLink}
            href={`${PROFILE}/${post.author.username}`}
            textStyle="body-2"
            color="base.content.medium"
          >
            @{post.author.username}
          </Link>
          <Text
            title={post.createdAt.toLocaleString()}
            textStyle="body-2"
            color="base.content.medium"
          >
            {relativeDate}
          </Text>
        </Stack>
        <RichText defaultValue={post?.contentHtml} isReadOnly />
        <PostImages images={post.images} />
        {!hideActions && <PostActions post={post} />}
      </Stack>
    </Stack>
  )
}
