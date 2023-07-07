import { useCallback } from 'react'
import Router from 'next/router'
import { trpc } from '~/utils/trpc'

export const useMe = ({ redirectTo = '', redirectIfFound = false } = {}) => {
  const [me] = trpc.me.get.useSuspenseQuery(undefined, {
    onSuccess: async () => {
      if (redirectIfFound) {
        await Router.push(redirectTo)
      }
    },
  })
  const logoutMutation = trpc.auth.logout.useMutation()

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          if (redirectToSignIn) {
            await Router.push('/sign-in')
          }
        },
      })
    },
    [logoutMutation]
  )

  return { me, logout }
}
