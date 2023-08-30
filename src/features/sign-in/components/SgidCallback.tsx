import { useRouter } from 'next/router'
import { FullscreenSpinner } from '~/components/FullscreenSpinner'
import { trpc } from '~/utils/trpc'

/**
 * This component is responsible for handling the callback from the SGID login.
 */
export const SgidCallback = () => {
  const router = useRouter()
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
        await router.replace(redirectUrl)
      },
      onError: async (error) => {
        // Server should return redirectUrl even on error, this function is a fallback.
        console.error(error)
        await router.replace('/sign-in')
      },
    }
  )

  return <FullscreenSpinner />
}
