import { Box } from '@chakra-ui/react'
import { NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'

const Replies: NextPageWithLayout = () => {
  return <Box>Replies</Box>
}

Replies.getLayout = ProfileLayout

export default Replies
