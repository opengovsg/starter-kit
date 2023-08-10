import { Button } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { useLocalStorage } from 'usehooks-ts'
import { useFeatures } from '~/components/AppProviders'
import { LOGGED_IN_KEY } from '~/constants/localStorage'
import { trpc } from '~/utils/trpc'

export const SgidLoginButton = (): JSX.Element | null => {
  const [, setIsAuthenticated] = useLocalStorage<boolean>(LOGGED_IN_KEY, false)
  const router = useRouter()
  const { sgid } = useFeatures()
  const sgidLoginMutation = trpc.auth.sgid.login.useMutation({
    onSuccess: async ({ redirectUrl }) => {
      setIsAuthenticated(true)
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
