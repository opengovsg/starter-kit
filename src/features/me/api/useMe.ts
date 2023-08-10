import { useCallback } from 'react'
import Router from 'next/router'
import { trpc } from '~/utils/trpc'
import { LOGGED_IN_KEY } from '~/constants/insecureCookies'
import { setCookie } from 'cookies-next'

export const useMe = () => {
  const utils = trpc.useContext()
  const [me] = trpc.me.get.useSuspenseQuery()

  const logoutMutation = trpc.auth.logout.useMutation()

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          setCookie(LOGGED_IN_KEY, true)
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
