import { Box } from '@chakra-ui/react'
import { NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'

const Liked: NextPageWithLayout = () => {
  return <Box>Liked</Box>
}

Liked.getLayout = ProfileLayout

export default Liked
