import { Container, Flex, Stack, Text } from '@chakra-ui/react'
import { type InferGetServerSidePropsType } from 'next'
import { useMemo } from 'react'
import { FeedbackComment, FeedbackNavbar } from '~/features/feedback/components'
import { FeedbackCommentRichText } from '~/features/feedback/components/FeedbackCommentRichText'
import { createSsgHelper } from '~/lib/ssg'
import { type NextPageWithLayout } from '~/lib/types'
import { withSessionSsr } from '~/lib/withSession'
import { trpc } from '~/utils/trpc'

const PostViewPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { id } = props
  // This query will be immediately available as it's prefetched.
  const { data, isSuccess } = trpc.post.byId.useQuery({ id })

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

  if (!isSuccess) {
    return <div>Should not happen</div>
  }

  return (
    <Flex flexDir="column" bg="base.canvas.brand-subtle" minH="$100vh">
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
            {data.comments.map((comment) => (
              <FeedbackComment key={comment.id} post={comment} />
            ))}
          </Stack>
          <FeedbackCommentRichText postId={data.id} />
        </Stack>
      </Container>
    </Flex>
  )
}

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req, params }) {
    const ssg = await createSsgHelper(req.session)
    const id = params?.id as string

    try {
      // Fetch `post.byId` so the data is cached in queryClient.
      await ssg.post.byId.fetch({ id })

      return {
        props: {
          trpcState: ssg.dehydrate(),
          id,
        },
      }
    } catch (err) {
      return {
        // If failed, return 404
        props: { id },
        notFound: true,
      }
    }
  }
)

export default PostViewPage
