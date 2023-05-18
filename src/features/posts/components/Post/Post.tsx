import { Avatar, Stack, Text } from '@chakra-ui/react'
import { Link } from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { KeyboardEventHandler, ReactEventHandler, useMemo } from 'react'
import { RichText } from '~/components/RichText'
import { formatRelativeTime } from '~/lib/dates'
import { PROFILE } from '~/lib/routes'
import { RouterOutput } from '~/utils/trpc'
import { PostActions } from '../PostActions'

export interface PostProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  hideActions?: boolean
}

export const Post = ({ post, hideActions }: PostProps): JSX.Element => {
  const router = useRouter()
  const relativeDate = useMemo(() => formatRelativeTime(post.createdAt), [post])

  const onClick: ReactEventHandler = (e) => {
    // data-values are added to all post actions so that we can distinguish
    // between clicking on the post itself and clicking on an action, and only
    // navigate to the thread if the post itself is clicked
    const isAction = !!(e.target as HTMLElement).getAttribute('data-value')
    if (!isAction) {
      router.push(`/thread/${post.id}`)
    }
  }

  const onKeyDown: KeyboardEventHandler = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick(event)
    }
  }

  return (
    <Stack
      role="button"
      layerStyle="post"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      cursor="pointer"
      direction="row"
      p="1.5rem"
      spacing="0.75rem"
    >
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
        {!hideActions && <PostActions post={post} />}
      </Stack>
    </Stack>
  )
}
