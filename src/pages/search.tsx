import { Box, Text } from '@chakra-ui/react'
import { Searchbar } from '@opengovsg/design-system-react'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { FeedbackComment } from '~/features/feedback/components'
import type { NextPageWithLayout } from '~/lib/types'
import { AdminLayout } from '~/templates/layouts/AdminLayout'
import { trpc } from '~/utils/trpc'

const Search: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ query }) => {
  const router = useRouter()
  const [queryInput, setQueryInput] = useState(query)
  const { data, isLoading } = trpc.post.search.useQuery({ query })

  const updateSearchQuery = useCallback(
    (newQuery: string) => {
      if (!newQuery) return
      router.query.q = newQuery
      router.push(router)
    },
    [router]
  )

  return (
    <Box w="100%">
      <Box w="20rem">
        <Searchbar
          isExpanded
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onSearch={updateSearchQuery}
        />
      </Box>
      <Text>{isLoading ? 'Searching...' : `${data?.length} results`}</Text>
      {data?.map((d) => (
        <FeedbackComment key={d.id} post={d} />
      ))}
    </Box>
  )
}

Search.getLayout = AdminLayout

export const getServerSideProps: GetServerSideProps<{
  query: string
}> = async ({ query }) => {
  if (!query.q) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    }
  }
  return {
    props: { query: String(query.q) },
  }
}

export default Search
