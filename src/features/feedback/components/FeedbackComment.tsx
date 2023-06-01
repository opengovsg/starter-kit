import { Avatar, Box, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { RichText } from '~/components/RichText'
import type { RouterOutput } from '~/utils/trpc'
import { formatInTimeZone } from 'date-fns-tz'

type PostByIdOutput = Pick<
  RouterOutput['post']['byId'],
  'author' | 'contentHtml' | 'createdAt'
>

interface FeedbackCommentProps {
  post?: PostByIdOutput
}

export const FeedbackComment = ({ post }: FeedbackCommentProps) => {
  const prettyDate = useMemo(() => {
    if (!post) return ''
    return formatInTimeZone(
      new Date(post.createdAt),
      'Asia/Singapore',
      'dd MMM yyyy, hh:mmaaa'
    )
  }, [post])

  return (
    <Stack direction="row">
      <Avatar src={post?.author.image ?? undefined} size="xs" />
      <Box flex={1}>
        <Stack>
          <RichText
            sx={{
              '.ProseMirror': {
                minH: 'auto',
              },
            }}
            defaultValue={post?.contentHtml}
            isReadOnly
          />
          <Text textStyle="caption-2" color="base.content.medium">
            {`${post?.author.name}, ${prettyDate}`}
          </Text>
        </Stack>
      </Box>
    </Stack>
  )
}
