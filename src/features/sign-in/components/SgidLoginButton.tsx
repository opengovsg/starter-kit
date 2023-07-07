import { Button } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { useFeatures } from '~/components/AppProviders'
import { trpc } from '~/utils/trpc'

export const SgidLoginButton = (): JSX.Element | null => {
  const router = useRouter()
  const { sgid } = useFeatures()
  const sgidLoginMutation = trpc.auth.sgid.login.useMutation({
    onSuccess: async ({ redirectUrl }) => {
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
      variant="outline"
      isLoading={sgidLoginMutation.isLoading}
      onClick={handleSgidLogin}
    >
      Log in with Singpass app
    </Button>
  )
}
