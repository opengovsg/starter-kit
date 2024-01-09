import { useCallback } from 'react'
import Router from 'next/router'
import { trpc } from '~/utils/trpc'
import { useLoginState } from '~/features/auth'

export const useMe = () => {
  const [me] = trpc.me.get.useSuspenseQuery()

  const { removeLoginStateFlag } = useLoginState()
  const logoutMutation = trpc.auth.logout.useMutation()

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          removeLoginStateFlag()
          if (redirectToSignIn) {
            await Router.push('/sign-in')
          }
        },
      })
    },
    [logoutMutation, removeLoginStateFlag],
  )

  return { me, logout }
}
