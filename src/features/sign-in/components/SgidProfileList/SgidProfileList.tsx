import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { Divider, Stack } from '@chakra-ui/react'

import { trpc } from '~/utils/trpc'
import { SgidProfileItem } from './SgidProfileItem'
import { SgidProfileListSkeleton } from './SgidProfileListSkeleton'
import { useLoginState } from '~/features/auth'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { withSuspense } from '~/hocs/withSuspense'
import { callbackUrlSchema } from '~/schemas/url'

const _SgidProfileList = (): JSX.Element => {
  const router = useRouter()

  const { setHasLoginStateFlag } = useLoginState()

  const utils = trpc.useContext()

  const [profiles] = trpc.auth.sgid.listStoredProfiles.useSuspenseQuery()
  const selectMutation = trpc.auth.sgid.selectProfile.useMutation({
    onSuccess: async () => {
      setHasLoginStateFlag()
      await utils.me.get.invalidate()
      await router.replace(
        callbackUrlSchema.parse(router.query[CALLBACK_URL_KEY]),
      )
    },
  })

  const handleSelectProfile = useCallback(
    (email?: string) => {
      if (!email) return
      return selectMutation.mutate({ email })
    },
    [selectMutation],
  )

  return (
    <Stack divider={<Divider />}>
      {profiles.map((profile) => (
        <SgidProfileItem
          profile={profile}
          key={profile.work_email}
          onClick={() => handleSelectProfile(profile.work_email)}
        />
      ))}
    </Stack>
  )
}

export const SgidProfileList = withSuspense(
  _SgidProfileList,
  <SgidProfileListSkeleton />,
)
