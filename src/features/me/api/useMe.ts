import { useCallback } from 'react'
import Router from 'next/router'
import { trpc } from '~/utils/trpc'
import { LOGGED_IN_KEY } from '~/constants/insecureCookies'
import { deleteCookie } from 'cookies-next'

export const useMe = () => {
  const utils = trpc.useContext()
  const [me] = trpc.me.get.useSuspenseQuery()

  const logoutMutation = trpc.auth.logout.useMutation()

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          deleteCookie(LOGGED_IN_KEY)
          await utils.invalidate()
          if (redirectToSignIn) {
            await Router.push('/sign-in')
          }
        },
      })
    },
    [logoutMutation, utils]
  )

  return { me, logout }
}
