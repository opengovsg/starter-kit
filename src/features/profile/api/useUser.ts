import { useCallback } from 'react'
import Router from 'next/router'
import { trpc } from '~/utils/trpc'

export const useUser = ({ redirectTo = '', redirectIfFound = false } = {}) => {
  const [user] = trpc.me.get.useSuspenseQuery(undefined, {
    onSuccess: () => {
      if (redirectIfFound) {
        Router.push(redirectTo)
      }
    },
  })

  const logoutMutation = trpc.auth.logout.useMutation()

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: () => {
          if (redirectToSignIn) Router.push('/sign-in')
        },
      })
    },
    [logoutMutation]
  )

  return { user, logout }
}
