import { useCallback } from 'react'
import Router from 'next/router'
import { trpc } from '~/utils/trpc'
import { useLocalStorage } from 'usehooks-ts'
import { LOGGED_IN_KEY } from '~/constants/localStorage'

export const useMe = () => {
  const [, setIsAuthenticated] = useLocalStorage<boolean>(LOGGED_IN_KEY, false)
  const [me] = trpc.me.get.useSuspenseQuery()

  const logoutMutation = trpc.auth.logout.useMutation()

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          setIsAuthenticated(false)
          if (redirectToSignIn) {
            await Router.push('/sign-in')
          }
        },
      })
    },
    [logoutMutation, setIsAuthenticated]
  )

  return { me, logout }
}
