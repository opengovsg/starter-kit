import { Avatar, Stack, type StackProps, Text } from '@chakra-ui/react'
import { Link } from '@opengovsg/design-system-react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { type ReactEventHandler, useMemo } from 'react'
import { RichText } from '~/components/RichText'
import { PostActions, PostImages } from '~/features/posts/components'
import { formatRelativeTime } from '~/lib/dates'
import { PROFILE } from '~/lib/routes'
import { type RouterOutput } from '~/utils/trpc'

export interface ThreadPostProps {
  post: RouterOutput['post']['byUser']['posts'][number]
  hideActions?: boolean
  containerProps?: StackProps
}

export const ThreadPost = ({
  post: reply,
  hideActions,
  containerProps,
}: ThreadPostProps): JSX.Element => {
  const router = useRouter()

  const onClick: ReactEventHandler = async (e) => {
    // data-values are added to all post actions so that we can distinguish
    // between clicking on the post itself and clicking on an action, and only
    // navigate to the thread if the post itself is clicked
    const isAction = !!(e.target as HTMLElement).getAttribute('data-value')
    if (!isAction) {
      await router.push(`/thread/${reply.id}`)
    }
  }

  const relativeDate = useMemo(
    () => formatRelativeTime(reply.createdAt),
    [reply],
  )
  return (
    <Stack
      aria-hidden
      direction="row"
      py="1.5rem"
      mx={{ base: '-1rem' }}
      px={{ base: '1rem' }}
      spacing="0.75rem"
      onClick={onClick}
      layerStyle="post"
      tabIndex={0}
      cursor="pointer"
      role="button"
      {...containerProps}
    >
      <Avatar
        variant="subtle"
        bg="base.canvas.brand-subtle"
        name={reply.author?.name ?? undefined}
        src={reply.author.image ?? undefined}
        size="md"
      />
      <Stack direction="column" spacing="0.5rem" flex={1}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 0, md: '1rem' }}
        >
          <Text textStyle="subhead-2" color="base.content.strong">
            {reply.author.name}
          </Text>
          <Stack direction="row" spacing="1rem">
            <Link
              data-value="post-action"
              variant="standalone"
              p={0}
              as={NextLink}
              href={`${PROFILE}/${reply.author.username}`}
              textStyle="body-2"
              color="base.content.medium"
            >
              @{reply.author.username}
            </Link>
            <Text
              title={reply.createdAt.toLocaleString()}
              textStyle="body-2"
              color="base.content.medium"
            >
              {relativeDate}
            </Text>
          </Stack>
        </Stack>
        <Stack ml={{ base: '-3.25rem', md: 0 }}>
          <RichText defaultValue={reply?.contentHtml} isReadOnly />
          <PostImages images={reply.images} />
          {!hideActions && <PostActions post={reply} />}
        </Stack>
      </Stack>
    </Stack>
  )
}
