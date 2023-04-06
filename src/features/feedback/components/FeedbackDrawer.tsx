import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { Avatar } from '~/components/Avatar'
import { RichText } from '~/components/RichText'
import { RouterOutput, trpc } from '~/utils/trpc'
import { FeedbackCommentRichText } from './FeedbackCommentRichText'

type PostByIdOutput = Pick<
  RouterOutput['post']['byId'],
  'author' | 'contentHtml' | 'createdAt'
>

interface FeedbackCommentProps {
  post?: PostByIdOutput
  isLoading?: boolean
}

const FeedbackComment = ({ post, isLoading }: FeedbackCommentProps) => {
  if (isLoading) {
    return (
      <Stack direction="row">
        <SkeletonCircle size="2rem" />
        <Skeleton flex={1} h="2rem" />
      </Stack>
    )
  }

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
            {`${post?.author.name}, ${post?.createdAt}`}
          </Text>
        </Stack>
      </Box>
    </Stack>
  )
}

export const FeedbackDrawer = (): JSX.Element | null => {
  const router = useRouter()
  const feedbackId = router.query.feedbackId as string

  const isOpen = !!feedbackId

  const utils = trpc.useContext()

  const setReadMutation = trpc.post.setRead.useMutation({
    onSuccess: () => {
      utils.post.list.invalidate()
    },
  })

  const { data, isLoading } = trpc.post.byId.useQuery(
    { id: feedbackId },
    {
      enabled: isOpen,
      onSuccess: () =>
        setReadMutation.mutate(
          { id: feedbackId },
          {
            onSuccess: () => {
              utils.post.unreadCount.invalidate()
            },
          }
        ),
    }
  )

  const handleCloseDrawer = useCallback(() => {
    delete router.query.feedbackId
    router.push(router)
  }, [router])

  if (!data) return null

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      size="lg"
      onClose={handleCloseDrawer}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">{data?.author.name}</DrawerHeader>
        <DrawerBody>
          <Stack spacing="1.5rem">
            <FeedbackComment post={data} isLoading={isLoading} />
            <Stack spacing="1.5rem">
              {data?.comments.map((comment) => (
                <FeedbackComment key={comment.id} post={comment} />
              ))}
            </Stack>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <FeedbackCommentRichText
            postId={data.id}
            handleCancel={handleCloseDrawer}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
