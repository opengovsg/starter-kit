import { Box } from '@chakra-ui/react'
import { NextPageWithLayout } from '~/lib/types'
import { AdminLayout } from '~/templates/layouts/AdminLayout'

import { useRouter } from 'next/router'
import { useMe } from '~/features/me/api'
import { ProfileDescription } from '~/features/profile/components/ProfileDescription'
import { trpc } from '~/utils/trpc'
import { useMemo } from 'react'
import { AppGrid } from '~/templates/AppGrid'
import {
  PROFILE_GRID_COLUMN,
  PROFILE_GRID_TEMPLATE_COLUMN,
} from '~/constants/layouts'

const Profile: NextPageWithLayout = () => {
  const { me } = useMe()
  const { isReady, query } = useRouter()
  const username = String(query.username)

  const { data, isLoading } = trpc.profile.byUsername.useQuery(
    { username },
    { enabled: isReady }
  )

  const isOwnProfile = useMemo(
    () => me?.username === username,
    [me?.username, username]
  )

  if (isLoading || !data) {
    return <div>Loading</div>
  }

  return (
    <Box w="100%">
      <AppGrid
        templateColumns={PROFILE_GRID_TEMPLATE_COLUMN}
        bg="base.canvas.brand-subtle"
      >
        <Box gridColumn={PROFILE_GRID_COLUMN}>
          <ProfileDescription profile={data} isOwnProfile={isOwnProfile} />
        </Box>
      </AppGrid>
    </Box>
  )
}

Profile.getLayout = AdminLayout

export default Profile
