import { Box } from '@chakra-ui/react'
import { NextPageWithLayout } from '~/lib/types'

import { ProfileLayout } from '~/templates/layouts/ProfileLayout'

const Profile: NextPageWithLayout = () => {
  return <Box>Profile</Box>
}

Profile.getLayout = ProfileLayout

export default Profile
