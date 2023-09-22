import { useRouter } from 'next/router'
import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import { useLoginState } from '~/features/auth'
import { trpc } from '~/utils/trpc'

/**
 * This component is responsible for handling the callback from the SGID login.
 */
export const SgidCallback = () => {
  const utils = trpc.useContext()
  const router = useRouter()
  const { setHasLoginStateFlag } = useLoginState()
  const {
    query: { code, state },
  } = router

  trpc.auth.sgid.callback.useSuspenseQuery(
    {
      code: String(code),
      state: String(state),
    },
    {
      onSuccess: async ({ redirectUrl }) => {
        setHasLoginStateFlag()
        await utils.me.get.invalidate()
        await router.replace(redirectUrl)
      },
      onError: async (error) => {
        console.error(error)
        await router.replace(`/sign-in?error=${error.message}`)
      },
    }
  )

  return <FullscreenSpinner />
}
