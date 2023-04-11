import { InferGetServerSidePropsType } from 'next'
import { createSsgHelper } from '~/lib/ssg'
import { NextPageWithLayout } from '~/lib/types'
import { withSessionSsr } from '~/lib/withSession'
import { RouterOutput, trpc } from '~/utils/trpc'

type PostByIdOutput = RouterOutput['post']['byId']

interface FeedbackItemProps {
  post: PostByIdOutput
}

const FeedbackItem = ({ post }: FeedbackItemProps) => {
  return (
    <>
      <h1>{post.title}</h1>
      <em>Created {post.createdAt.toLocaleDateString('en-us')}</em>

      <p>{post.contentHtml}</p>

      <h2>Raw data:</h2>
      <pre>{JSON.stringify(post, null, 4)}</pre>
    </>
  )
}

const PostViewPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { id } = props
  // This query will be immediately available as it's prefetched.
  const { data, isSuccess } = trpc.post.byId.useQuery({ id })

  if (!isSuccess) {
    return <div>Should not happen</div>
  }
  return <FeedbackItem post={data} />
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
