import { Button } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { env } from '~/env.mjs'
import { trpc } from '~/utils/trpc'

export const SgidLoginButton = (): JSX.Element | null => {
  const router = useRouter()
  const sgidLoginMutation = trpc.auth.sgid.login.useMutation({
    onSuccess: ({ redirectUrl }) => {
      router.push(redirectUrl)
    },
  })

  const handleSgidLogin = () => {
    return sgidLoginMutation.mutate({})
  }

  if (!env.NEXT_PUBLIC_ENABLE_SGID) {
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
