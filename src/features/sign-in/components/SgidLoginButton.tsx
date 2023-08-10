import { Button } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { useFeatures } from '~/components/AppProviders'
import { LOGGED_IN_KEY } from '~/constants/insecureCookies'
import { trpc } from '~/utils/trpc'
import { setCookie } from 'cookies-next'

export const SgidLoginButton = (): JSX.Element | null => {
  const router = useRouter()
  const { sgid } = useFeatures()
  const sgidLoginMutation = trpc.auth.sgid.login.useMutation({
    onSuccess: async ({ redirectUrl }) => {
      setCookie(LOGGED_IN_KEY, true)
      await router.push(redirectUrl)
    },
  })

  const handleSgidLogin = () => {
    return sgidLoginMutation.mutate({})
  }

  if (!sgid) {
    return null
  }

  return (
    <Button
      variant="clear"
      isLoading={sgidLoginMutation.isLoading}
      onClick={handleSgidLogin}
    >
      Log in with Singpass app
    </Button>
  )
}
