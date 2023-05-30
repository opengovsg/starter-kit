import { Button } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { trpc } from '~/utils/trpc'

export const SgidLoginButton = (): JSX.Element => {
  const router = useRouter()
  const sgidLoginMutation = trpc.auth.sgid.login.useMutation({
    onSuccess: ({ redirectUrl }) => {
      router.push(redirectUrl)
    },
  })

  const handleSgidLogin = () => {
    return sgidLoginMutation.mutate({})
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
