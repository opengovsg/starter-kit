import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'

const ThreadPage = () => {
  const { query } = useRouter()
  return <Box>This is the thread page for {String(query.postId)}</Box>
}

export default ThreadPage
