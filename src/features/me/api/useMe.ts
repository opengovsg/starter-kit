import { useCallback, useEffect } from 'react'
import Router from 'next/router'
import { trpc } from '~/utils/trpc'

export const useMe = ({ redirectTo = '', redirectIfFound = false } = {}) => {
  const { data: me, isFetching, ...rest } = trpc.me.get.useQuery()

  useEffect(() => {
    // if no redirect needed, just return (example: already on routes.HOME)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || isFetching) return

    const shouldRedirect =
      // If redirectTo is set,
      redirectTo &&
      // redirect if the user was not found.
      ((!redirectIfFound && !me) ||
        // If redirectIfFound is also set, redirect if the user was found
        (redirectIfFound && me))

    if (shouldRedirect) {
      Router.push(redirectTo)
    }
  }, [me, redirectIfFound, redirectTo, isFetching])

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

  return { me, isFetching, ...rest, logout }
}
