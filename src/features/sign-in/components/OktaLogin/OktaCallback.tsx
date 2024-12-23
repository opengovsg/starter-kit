import { useLoginState } from '~/features/auth'
import { useRouter } from 'next/router'
import { trpc } from '~/utils/trpc'
import { useEffect } from 'react'
import { callbackUrlSchema } from '~/schemas/url'
import { FullscreenSpinner } from '~/components/FullscreenSpinner'

export const OktaCallback = (): JSX.Element => {
  const { setHasLoginStateFlag } = useLoginState()

  const router = useRouter()
  const utils = trpc.useUtils()

  const {
    query: { code, state },
  } = router

  const [{ redirectUrl }] = trpc.auth.okta.callback.useSuspenseQuery(
    { code: String(code), state: String(state) },
    { staleTime: Infinity },
  )

  useEffect(() => {
    setHasLoginStateFlag()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    utils.me.get.invalidate()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.replace(callbackUrlSchema.parse(redirectUrl))
  }, [redirectUrl, router, setHasLoginStateFlag, utils.me.get])

  return <FullscreenSpinner />
}
