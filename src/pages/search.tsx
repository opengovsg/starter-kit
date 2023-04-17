import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from '~/lib/types'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

const Search: NextPageWithLayout = () => {
  const router = useRouter()
  return <Box>This is the search box with query: {String(router.query.q)}</Box>
}

Search.getLayout = AdminLayout

export default Search
