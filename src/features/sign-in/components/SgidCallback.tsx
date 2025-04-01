import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { trpc } from '~/utils/trpc'
import { appendWithRedirect } from '~/utils/url'
import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import { useLoginState } from '~/features/auth'
import { SIGN_IN, SIGN_IN_SELECT_PROFILE } from '~/lib/routes'

/**
 * This component is responsible for handling the callback from the SGID login.
 */
export const SgidCallback = (): JSX.Element => {
  const { setHasLoginStateFlag } = useLoginState()

  const router = useRouter()
  const utils = trpc.useUtils()

  const {
    query: { code, state },
  } = router

  const [response] = trpc.auth.sgid.callback.useSuspenseQuery(
    { code: String(code), state: String(state) },
    { staleTime: Infinity },
  )

  useEffect(() => {
    if (!response.success) {
      void router.replace(
        `${SIGN_IN}?${new URLSearchParams({ error: response.reason })}`,
      )
    } else {
      const { selectProfileStep, landingUrl } = response.data
      if (!selectProfileStep) {
        setHasLoginStateFlag()
        void utils.me.get.invalidate()
      }
      void router.replace(
        appendWithRedirect(SIGN_IN_SELECT_PROFILE, landingUrl),
      )
    }
  }, [response, router, setHasLoginStateFlag, utils.me.get])

  return <FullscreenSpinner />
}
