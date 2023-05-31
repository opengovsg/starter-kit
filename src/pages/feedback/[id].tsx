import { Container, Flex, Spinner, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import ErrorBoundary from '~/components/ErrorBoundary/ErrorBoundary'
import Suspense from '~/components/Suspense'
import { FeedbackComment, FeedbackNavbar } from '~/features/feedback/components'
import { FeedbackCommentRichText } from '~/features/feedback/components/FeedbackCommentRichText'
import { type NextPageWithLayout } from '~/lib/types'
import { trpc } from '~/utils/trpc'

const PostViewPage: NextPageWithLayout = () => {
  return (
    <Flex flexDir="column" bg="base.canvas.brand-subtle" minH="$100vh">
      <ErrorBoundary>
        <Suspense fallback={<Spinner />}>
          <PostViewContainer />
        </Suspense>
      </ErrorBoundary>
    </Flex>
  )
}

const PostViewContainer = () => {
  const router = useRouter()

  const id = String(router.query.id)

  const utils = trpc.useContext()

  const [data] = trpc.post.byId.useSuspenseQuery({ id })

  const { mutate } = trpc.post.setRead.useMutation()

  const viewPostCrumbs = useMemo(() => {
    return [
      {
        label: 'All feedback',
        href: '/dashboard',
      },
      {
        label: data?.author.name ?? 'loading',
        last: true,
        href: `/feedback/${id}`,
      },
    ]
  }, [data?.author.name, id])

  useEffect(() => {
    if (router.isReady) {
      mutate(
        { id },
        {
          onSuccess: () => {
            utils.post.list.invalidate()
            utils.post.unreadCount.invalidate()
          },
        }
      )
    }
    // Only want to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  return (
    <>
      <FeedbackNavbar crumbs={viewPostCrumbs} />

      <Container my="3.5rem">
        <Stack mb="1.25rem">
          <Text as="h1" textStyle="h4">
            Feedback from {data.author.name}
          </Text>
          <Text textStyle="subhead-2" color="base.content.medium">
            Reply to share your concerns and ideas directly.
          </Text>
        </Stack>
        <Stack
          mb="2rem"
          spacing="1.5rem"
          bg="white"
          px="2rem"
          py="2.5rem"
          borderRadius="md"
          borderWidth="1px"
          borderColor="base.divider.medium"
        >
          <FeedbackComment post={data} />
          <Stack spacing="1.5rem">
            {data.replies.map((reply) => (
              <FeedbackComment key={reply.id} post={reply} />
            ))}
          </Stack>
          <FeedbackCommentRichText postId={data.id} />
        </Stack>
      </Container>
    </>
  )
}

export default PostViewPage
