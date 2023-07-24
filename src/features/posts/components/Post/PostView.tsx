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
    <Stack
      flexDir="column"
      spacing="1rem"
      px={{ base: '1rem', lg: '1.5rem' }}
      mx={{ base: '-1rem', lg: '-1.5rem' }}
      {...containerProps}
    >
      <Stack spacing="1rem" direction="row">
        <Avatar
          variant="subtle"
          bg="base.canvas.brand-subtle"
          name={post.author?.name ?? undefined}
          src={post.author.image ?? undefined}
          size="md"
        />
        <Stack spacing={0}>
          <Text textStyle="subhead-2" color="base.content.strong">
            {post.author.name}
          </Text>
          <Stack direction="row" spacing="1rem">
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
        </Stack>
      </Stack>
      <Stack>
        <RichText defaultValue={post?.contentHtml} isReadOnly />
        <PostImages images={post.images} />
        {!hideActions && <PostActions post={post} />}
      </Stack>
    </Stack>
  )
}
